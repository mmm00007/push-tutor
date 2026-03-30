/**
 * Main audio engine implementation.
 * Uses Web Audio API with a simple gain/compressor chain.
 * AudioWorklet path reserved for future Wasm DSP integration.
 */

import type { AudioEngine, AudioEngineState, InstrumentPreset } from './types';
import { VoiceAllocator } from './voice-allocator';
import { PRESETS } from '../presets';

export class WebAudioEngine implements AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private voiceAllocator: VoiceAllocator | null = null;
  private currentPresetName = 'piano';

  async init(): Promise<void> {
    if (this.ctx) return;

    this.ctx = new AudioContext({ sampleRate: 44100, latencyHint: 'interactive' });

    // Master chain: voices -> compressor -> master gain -> destination
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    const preset = PRESETS[this.currentPresetName] ?? PRESETS['piano']!;
    this.voiceAllocator = new VoiceAllocator(this.ctx, this.compressor, preset);
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  noteOn(midi: number, velocity = 0.8): void {
    if (!this.voiceAllocator || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.voiceAllocator.noteOn(midi, velocity);
  }

  noteOff(midi: number): void {
    this.voiceAllocator?.noteOff(midi);
  }

  allNotesOff(): void {
    this.voiceAllocator?.allNotesOff();
  }

  setPreset(presetName: string): void {
    const preset = PRESETS[presetName];
    if (!preset) return;
    this.currentPresetName = presetName;
    this.voiceAllocator?.setPreset(preset);
  }

  getState(): AudioEngineState {
    return {
      initialized: this.ctx !== null,
      suspended: this.ctx?.state === 'suspended',
      activeVoices: this.voiceAllocator?.activeCount ?? 0,
      currentPreset: this.currentPresetName,
    };
  }

  setVolume(volume: number): void {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, volume)),
      this.ctx.currentTime,
      0.01,
    );
  }

  metronomeClick(accent = false): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freq = accent ? 1200 : 800;
    const duration = 0.03;
    const gain = accent ? 0.4 : 0.25;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.01);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }

  dispose(): void {
    this.voiceAllocator?.dispose();
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.voiceAllocator = null;
  }
}

/** Singleton-ish factory. The app creates one engine and shares it via store. */
export function createAudioEngine(): AudioEngine {
  return new WebAudioEngine();
}
