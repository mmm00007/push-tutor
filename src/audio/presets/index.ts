import type { InstrumentPreset } from '../engine/types';

/**
 * Presets tuned for stability on mobile Web Audio:
 * - Lower gains to prevent clipping when playing chords
 * - Gentle filter Qs to avoid resonance artifacts
 * - Longer attack on most presets to eliminate clicks
 * - Moderate detune for warmth without beating artifacts
 */
export const PRESETS: Record<string, InstrumentPreset> = {
  piano: {
    name: 'Piano',
    oscillatorType: 'triangle',
    oscillatorCount: 2,
    oscillator2Type: 'sine',
    oscillator2Detune: 4,
    oscillator2Gain: 0.5,
    attack: 0.008,
    decay: 0.4,
    sustain: 0.3,
    release: 0.5,
    filterFreq: 3500,
    filterQ: 0.7,
    filterType: 'lowpass',
    detuneSpread: 6,
    gain: 0.8,
  },
  organ: {
    name: 'Organ',
    oscillatorType: 'sine',
    oscillatorCount: 2,
    oscillator2Type: 'sine',
    oscillator2Detune: 1200, // octave up (drawbar 4')
    oscillator2Gain: 0.35,
    attack: 0.015,
    decay: 0.08,
    sustain: 0.85,
    release: 0.1,
    filterFreq: 5000,
    filterQ: 0.4,
    filterType: 'lowpass',
    detuneSpread: 1.5,
    gain: 0.6,
  },
  pluck: {
    name: 'Pluck',
    oscillatorType: 'sawtooth',
    oscillatorCount: 1,
    attack: 0.003,
    decay: 0.18,
    sustain: 0.04,
    release: 0.12,
    filterFreq: 2500,
    filterQ: 1.5,
    filterType: 'lowpass',
    detuneSpread: 0,
    gain: 0.7,
  },
  pad: {
    name: 'Soft Pad',
    oscillatorType: 'sine',
    oscillatorCount: 2,
    oscillator2Type: 'triangle',
    oscillator2Detune: 8,
    oscillator2Gain: 0.6,
    attack: 0.25,
    decay: 0.6,
    sustain: 0.65,
    release: 0.8,
    filterFreq: 1800,
    filterQ: 0.5,
    filterType: 'lowpass',
    detuneSpread: 8,
    gain: 0.6,
  },
  bass: {
    name: 'Bass',
    oscillatorType: 'sawtooth',
    oscillatorCount: 1,
    attack: 0.012,
    decay: 0.12,
    sustain: 0.55,
    release: 0.08,
    filterFreq: 700,
    filterQ: 2,
    filterType: 'lowpass',
    detuneSpread: 0,
    gain: 0.9,
  },
};

export const PRESET_KEYS = Object.keys(PRESETS) as readonly (keyof typeof PRESETS)[];
