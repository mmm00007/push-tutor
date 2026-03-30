/** MIDI note utilities for Push-style grid instruments. */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = (typeof NOTE_NAMES)[number];

export const ENHARMONIC_NAMES: Record<string, string> = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
};

export const FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const MIDI_MIN = 0;
export const MIDI_MAX = 127;

/** Pitch class (0–11) from MIDI note number. */
export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

/** Octave number (C4 = MIDI 60). */
export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/** Note name from MIDI number (sharp notation). */
export function noteName(midi: number): NoteName {
  return NOTE_NAMES[pitchClass(midi)]!;
}

/** Full note label like "C4" or "F#2". */
export function noteLabel(midi: number): string {
  return `${noteName(midi)}${octaveOf(midi)}`;
}

/** Note label with flat notation option. */
export function noteLabelFlat(midi: number): string {
  const name = noteName(midi);
  const flat = ENHARMONIC_NAMES[name];
  return `${flat ?? name}${octaveOf(midi)}`;
}

/** MIDI note number from note name and octave. C4 = 60. */
export function midiFromNote(name: NoteName, octave: number): number {
  const index = NOTE_NAMES.indexOf(name);
  return (octave + 1) * 12 + index;
}

/** Parse a note string like "C4" or "F#2" to MIDI number. */
export function parseMidiNote(note: string): number | null {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return null;
  const [, name, octStr] = match;
  const index = NOTE_NAMES.indexOf(name as NoteName);
  if (index === -1) return null;
  return (parseInt(octStr!, 10) + 1) * 12 + index;
}

/** Clamp a MIDI value to valid range. */
export function clampMidi(midi: number): number {
  return Math.max(MIDI_MIN, Math.min(MIDI_MAX, midi));
}

/** Frequency in Hz from MIDI note (A4 = 440 Hz). */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Transpose a MIDI note by semitones, clamped. */
export function transpose(midi: number, semitones: number): number {
  return clampMidi(midi + semitones);
}

/** Note name index from string (C=0, C#=1, ... B=11). Returns -1 if invalid. */
export function noteNameToIndex(name: string): number {
  const idx = NOTE_NAMES.indexOf(name as NoteName);
  if (idx !== -1) return idx;
  const flatIdx = FLAT_NOTE_NAMES.indexOf(name as (typeof FLAT_NOTE_NAMES)[number]);
  return flatIdx;
}
