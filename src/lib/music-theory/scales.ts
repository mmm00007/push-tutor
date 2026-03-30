/** Scale definitions and utilities. All scales are defined as interval patterns (semitone steps). */

export interface ScaleDefinition {
  readonly name: string;
  readonly intervals: readonly number[];
}

/** Built-in scales. Intervals are semitone distances from root. */
export const SCALES: Record<string, ScaleDefinition> = {
  major:            { name: 'Major',            intervals: [0, 2, 4, 5, 7, 9, 11] },
  naturalMinor:     { name: 'Natural Minor',    intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmonicMinor:    { name: 'Harmonic Minor',   intervals: [0, 2, 3, 5, 7, 8, 11] },
  melodicMinor:     { name: 'Melodic Minor',    intervals: [0, 2, 3, 5, 7, 9, 11] },
  dorian:           { name: 'Dorian',           intervals: [0, 2, 3, 5, 7, 9, 10] },
  mixolydian:       { name: 'Mixolydian',       intervals: [0, 2, 4, 5, 7, 9, 10] },
  majorPentatonic:  { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  minorPentatonic:  { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  chromatic:        { name: 'Chromatic',        intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
};

export const SCALE_KEYS = Object.keys(SCALES) as readonly (keyof typeof SCALES)[];

/** Get pitch classes (0–11) for a scale rooted at a given pitch class. */
export function scaleNotes(rootPitchClass: number, scale: ScaleDefinition): Set<number> {
  return new Set(scale.intervals.map(i => (rootPitchClass + i) % 12));
}

/** Check if a MIDI note belongs to a given scale. */
export function isInScale(midi: number, rootPitchClass: number, scale: ScaleDefinition): boolean {
  const pc = ((midi % 12) + 12) % 12;
  return scale.intervals.some(i => (rootPitchClass + i) % 12 === pc);
}

/** Check if a pitch class is the root of the scale. */
export function isRoot(midi: number, rootPitchClass: number): boolean {
  return ((midi % 12) + 12) % 12 === rootPitchClass;
}

/** Get degree of a note within a scale (0-indexed), or -1 if not in scale. */
export function scaleDegree(midi: number, rootPitchClass: number, scale: ScaleDefinition): number {
  const pc = ((midi % 12) + 12) % 12;
  const interval = (pc - rootPitchClass + 12) % 12;
  return scale.intervals.indexOf(interval);
}
