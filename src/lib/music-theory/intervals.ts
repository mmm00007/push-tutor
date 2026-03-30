/** Musical intervals as semitone distances. */

export const INTERVALS = {
  unison: 0,
  minorSecond: 1,
  majorSecond: 2,
  minorThird: 3,
  majorThird: 4,
  perfectFourth: 5,
  tritone: 6,
  perfectFifth: 7,
  minorSixth: 8,
  majorSixth: 9,
  minorSeventh: 10,
  majorSeventh: 11,
  octave: 12,
} as const;

export type IntervalName = keyof typeof INTERVALS;

export const INTERVAL_LABELS: Record<number, string> = {
  0: 'Unison',
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
  12: 'Octave',
};

/** Get interval name for a semitone distance (mod 12). */
export function intervalLabel(semitones: number): string {
  const normalized = ((semitones % 12) + 12) % 12;
  return INTERVAL_LABELS[normalized] ?? `${normalized} semitones`;
}

/** Semitone distance between two MIDI notes (always positive, mod 12). */
export function intervalBetween(midiA: number, midiB: number): number {
  return ((midiB - midiA) % 12 + 12) % 12;
}
