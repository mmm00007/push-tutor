/**
 * Polyphonic voice allocator with click-free envelopes.
 * Uses setTargetAtTime for smooth exponential curves instead of
 * linearRampToValueAtTime which can cause audible clicks.
 */

import type { Voice, InstrumentPreset } from './types';
import { midiToFrequency } from '@/lib/music-theory/notes';

const MAX_VOICES = 12;

/** Time constant multiplier: reach ~95% of target in 3×tau. */
const TAU_FACTOR = 0.33;

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
    if (this.voices.has(midi)) {
      this.releaseVoice(midi, true);
    }

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

    // Scale gain by velocity and reduce per-voice amplitude to prevent clipping
    // when playing chords (rough 1/sqrt(n) scaling baked into preset gain)
    const peakGain = velocity * p.gain * 0.35;

    // Filter — use gentle settings to avoid resonance artifacts
    const filter = this.ctx.createBiquadFilter();
    filter.type = p.filterType;
    filter.frequency.setValueAtTime(Math.min(p.filterFreq, this.ctx.sampleRate / 2.2), now);
    filter.Q.setValueAtTime(Math.min(p.filterQ, 8), now);

    // Gain envelope — use setTargetAtTime for click-free exponential curves
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now); // start near zero (not zero — avoids denorm)

    // Attack: ramp up to peak
    gainNode.gain.setTargetAtTime(peakGain, now, Math.max(p.attack * TAU_FACTOR, 0.002));

    // Decay->sustain: after attack phase, settle to sustain level
    const sustainGain = peakGain * p.sustain;
    const decayStart = now + p.attack;
    gainNode.gain.setTargetAtTime(sustainGain, decayStart, Math.max(p.decay * TAU_FACTOR, 0.005));

    // Connect: oscillators -> filter -> gain -> output
    filter.connect(gainNode);
    gainNode.connect(this.output);

    const oscillators: OscillatorNode[] = [];

    // Primary oscillator
    const osc1 = this.ctx.createOscillator();
    osc1.type = p.oscillatorType === 'custom' ? 'sine' : p.oscillatorType;
    osc1.frequency.setValueAtTime(freq, now);
    if (p.detuneSpread > 0) {
      osc1.detune.setValueAtTime(-p.detuneSpread / 2, now);
    }
    osc1.connect(filter);
    osc1.start(now);
    oscillators.push(osc1);

    // Secondary oscillator (for layered presets)
    if (p.oscillatorCount === 2 && p.oscillator2Type) {
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(p.oscillator2Gain ?? 0.4, now);
      osc2Gain.connect(filter);

      const osc2 = this.ctx.createOscillator();
      osc2.type = p.oscillator2Type;
      osc2.frequency.setValueAtTime(freq, now);
      osc2.detune.setValueAtTime(p.oscillator2Detune ?? p.detuneSpread / 2, now);
      osc2.connect(osc2Gain);
      osc2.start(now);
      oscillators.push(osc2);
    }

    // Filter envelope for plucky timbres — smooth sweep, not abrupt
    if (p.decay < 0.25 && p.filterFreq > 500) {
      const filterPeak = Math.min(p.filterFreq * 1.8, this.ctx.sampleRate / 2.2);
      filter.frequency.setValueAtTime(filterPeak, now);
      filter.frequency.setTargetAtTime(p.filterFreq, now, p.decay * 0.5);
    }

    return { oscillators, gainNode, filterNode: filter, midi, startTime: now, releasing: false };
  }

  private releaseVoice(midi: number, immediate: boolean): void {
    const voice = this.voices.get(midi);
    if (!voice) return;

    const now = this.ctx.currentTime;
    const releaseTime = immediate ? 0.015 : this.preset.release;

    voice.releasing = true;

    // Cancel any scheduled ramps, anchor current value, then release smoothly
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
    voice.gainNode.gain.setTargetAtTime(0.0001, now, Math.max(releaseTime * TAU_FACTOR, 0.005));

    // Schedule cleanup after envelope has died out
    const cleanupMs = (releaseTime + 0.1) * 1000;
    const voiceRef = voice;
    setTimeout(() => {
      try {
        voiceRef.oscillators.forEach(osc => osc.stop());
        voiceRef.oscillators.forEach(osc => osc.disconnect());
        voiceRef.filterNode.disconnect();
        voiceRef.gainNode.disconnect();
      } catch {
        // Already stopped
      }
      if (this.voices.get(midi) === voiceRef) {
        this.voices.delete(midi);
      }
    }, cleanupMs);
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
