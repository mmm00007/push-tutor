/** Audio engine type definitions and interfaces. */

export interface NoteEvent {
  readonly type: 'noteOn' | 'noteOff';
  readonly midi: number;
  readonly velocity: number;
  readonly time?: number;
}

export interface InstrumentPreset {
  readonly name: string;
  readonly oscillatorType: OscillatorType | 'custom';
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
  readonly filterFreq: number;
  readonly filterQ: number;
  readonly filterType: BiquadFilterType;
  readonly detuneSpread: number;
  readonly gain: number;
  /** Number of oscillators per voice (1 or 2 for detune). */
  readonly oscillatorCount: 1 | 2;
  /** Optional second oscillator type for layering. */
  readonly oscillator2Type?: OscillatorType;
  /** Optional second oscillator detune in cents. */
  readonly oscillator2Detune?: number;
  /** Optional second oscillator gain relative to first. */
  readonly oscillator2Gain?: number;
}

export interface Voice {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
  midi: number;
  startTime: number;
  releasing: boolean;
}

export interface AudioEngineState {
  initialized: boolean;
  suspended: boolean;
  activeVoices: number;
  currentPreset: string;
}

export interface AudioEngine {
  /** Initialize the audio context (must be called from user gesture). */
  init(): Promise<void>;
  /** Resume suspended context. */
  resume(): Promise<void>;
  /** Play a note. */
  noteOn(midi: number, velocity?: number): void;
  /** Release a note. */
  noteOff(midi: number): void;
  /** Release all notes. */
  allNotesOff(): void;
  /** Set the current instrument preset. */
  setPreset(presetName: string): void;
  /** Get current engine state. */
  getState(): AudioEngineState;
  /** Set master volume (0–1). */
  setVolume(volume: number): void;
  /** Play metronome click. */
  metronomeClick(accent?: boolean): void;
  /** Clean up resources. */
  dispose(): void;
}

export type AudioBackend = 'js' | 'wasm';
