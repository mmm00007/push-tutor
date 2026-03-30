/**
 * Polyphonic voice allocator.
 * Manages a pool of voices with note stealing when the max is exceeded.
 */

import type { Voice, InstrumentPreset } from './types';
import { midiToFrequency } from '@/lib/music-theory/notes';

const MAX_VOICES = 16;

export class VoiceAllocator {
  private voices: Map<number, Voice> = new Map();
  private ctx: AudioContext;
  private output: GainNode;
  private preset: InstrumentPreset;

  constructor(ctx: AudioContext, output: GainNode, preset: InstrumentPreset) {
    this.ctx = ctx;
    this.output = output;
    this.preset = preset;
  }

  setPreset(preset: InstrumentPreset): void {
    this.preset = preset;
  }

  noteOn(midi: number, velocity = 0.8): void {
    // If this note is already playing, release it first
    if (this.voices.has(midi)) {
      this.releaseVoice(midi, true);
    }

    // Steal oldest voice if at max
    if (this.voices.size >= MAX_VOICES) {
      const oldest = this.findOldestVoice();
      if (oldest !== null) {
        this.releaseVoice(oldest, true);
      }
    }

    const voice = this.createVoice(midi, velocity);
    this.voices.set(midi, voice);
  }

  noteOff(midi: number): void {
    this.releaseVoice(midi, false);
  }

  allNotesOff(): void {
    for (const midi of [...this.voices.keys()]) {
      this.releaseVoice(midi, true);
    }
  }

  get activeCount(): number {
    return this.voices.size;
  }

  dispose(): void {
    this.allNotesOff();
  }

  private createVoice(midi: number, velocity: number): Voice {
    const now = this.ctx.currentTime;
    const freq = midiToFrequency(midi);
    const p = this.preset;
    const vel = velocity * p.gain;

    // Create filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = p.filterType;
    filter.frequency.setValueAtTime(p.filterFreq, now);
    filter.Q.setValueAtTime(p.filterQ, now);

    // Create gain envelope
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vel, now + p.attack);
    gainNode.gain.linearRampToValueAtTime(vel * p.sustain, now + p.attack + p.decay);

    // Chain: oscillators -> filter -> gain -> output
    filter.connect(gainNode);
    gainNode.connect(this.output);

    // Create oscillators
    const oscillators: OscillatorNode[] = [];

    const osc1 = this.ctx.createOscillator();
    osc1.type = p.oscillatorType === 'custom' ? 'sine' : p.oscillatorType;
    osc1.frequency.setValueAtTime(freq, now);
    osc1.detune.setValueAtTime(-p.detuneSpread / 2, now);
    osc1.connect(filter);
    osc1.start(now);
    oscillators.push(osc1);

    if (p.oscillatorCount === 2 && p.oscillator2Type) {
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(p.oscillator2Gain ?? 0.5, now);
      osc2Gain.connect(filter);

      const osc2 = this.ctx.createOscillator();
      osc2.type = p.oscillator2Type;
      osc2.frequency.setValueAtTime(freq, now);
      osc2.detune.setValueAtTime(p.oscillator2Detune ?? p.detuneSpread / 2, now);
      osc2.connect(osc2Gain);
      osc2.start(now);
      oscillators.push(osc2);
    }

    // Filter envelope: quick sweep down for pluck-like timbres
    if (p.decay < 0.3) {
      filter.frequency.setValueAtTime(p.filterFreq * 2, now);
      filter.frequency.exponentialRampToValueAtTime(p.filterFreq, now + p.decay);
    }

    return {
      oscillators,
      gainNode,
      filterNode: filter,
      midi,
      startTime: now,
      releasing: false,
    };
  }

  private releaseVoice(midi: number, immediate: boolean): void {
    const voice = this.voices.get(midi);
    if (!voice) return;

    const now = this.ctx.currentTime;
    const releaseTime = immediate ? 0.01 : this.preset.release;

    voice.releasing = true;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
    voice.gainNode.gain.linearRampToValueAtTime(0, now + releaseTime);

    // Schedule cleanup
    const cleanupTime = (releaseTime + 0.05) * 1000;
    setTimeout(() => {
      try {
        voice.oscillators.forEach(osc => osc.stop());
        voice.oscillators.forEach(osc => osc.disconnect());
        voice.filterNode.disconnect();
        voice.gainNode.disconnect();
      } catch {
        // Already stopped
      }
      this.voices.delete(midi);
    }, cleanupTime);
  }

  private findOldestVoice(): number | null {
    let oldest: number | null = null;
    let oldestTime = Infinity;
    for (const [midi, voice] of this.voices) {
      if (voice.startTime < oldestTime) {
        oldestTime = voice.startTime;
        oldest = midi;
      }
    }
    return oldest;
  }
}
