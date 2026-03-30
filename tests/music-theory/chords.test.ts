import { describe, it, expect } from 'vitest';
import { CHORDS, chordNotes, chordGridShape } from '@/lib/music-theory/chords';

describe('chords', () => {
  describe('chordNotes', () => {
    it('C major = C E G (60, 64, 67)', () => {
      const notes = chordNotes(60, CHORDS['major']!);
      expect(notes).toEqual([60, 64, 67]);
    });

    it('A minor = A C E (69, 72, 76)', () => {
      const notes = chordNotes(69, CHORDS['minor']!);
      expect(notes).toEqual([69, 72, 76]);
    });

    it('C power = C G (48, 55)', () => {
      const notes = chordNotes(48, CHORDS['power']!);
      expect(notes).toEqual([48, 55]);
    });

    it('Cmaj7 = C E G B (60, 64, 67, 71)', () => {
      const notes = chordNotes(60, CHORDS['major7']!);
      expect(notes).toEqual([60, 64, 67, 71]);
    });

    it('Cm7 = C Eb G Bb (60, 63, 67, 70)', () => {
      const notes = chordNotes(60, CHORDS['minor7']!);
      expect(notes).toEqual([60, 63, 67, 70]);
    });

    it('C7 = C E G Bb (60, 64, 67, 70)', () => {
      const notes = chordNotes(60, CHORDS['dominant7']!);
      expect(notes).toEqual([60, 64, 67, 70]);
    });

    it('Csus2 = C D G (60, 62, 67)', () => {
      const notes = chordNotes(60, CHORDS['sus2']!);
      expect(notes).toEqual([60, 62, 67]);
    });

    it('Csus4 = C F G (60, 65, 67)', () => {
      const notes = chordNotes(60, CHORDS['sus4']!);
      expect(notes).toEqual([60, 65, 67]);
    });
  });

  describe('chordGridShape', () => {
    it('major triad shape is compact on 4ths grid', () => {
      const shape = chordGridShape(CHORDS['major']!);
      // Root at (0,0), major 3rd at (4,0), 5th at (2,1) [2+5=7]
      expect(shape[0]).toEqual({ x: 0, y: 0, interval: 0 });
      expect(shape[1]).toEqual({ x: 4, y: 0, interval: 4 });
      expect(shape[2]).toEqual({ x: 2, y: 1, interval: 7 });
    });

    it('minor triad differs from major only in 3rd position', () => {
      const major = chordGridShape(CHORDS['major']!);
      const minor = chordGridShape(CHORDS['minor']!);
      // Root and fifth should be the same
      expect(minor[0]).toEqual(major[0]);
      expect(minor[2]).toEqual(major[2]);
      // Minor 3rd is at x=3 vs major 3rd at x=4
      expect(minor[1]!.x).toBe(3);
      expect(major[1]!.x).toBe(4);
    });

    it('power chord has only 2 positions', () => {
      const shape = chordGridShape(CHORDS['power']!);
      expect(shape).toHaveLength(2);
    });

    it('all shapes start at (0,0)', () => {
      for (const chord of Object.values(CHORDS)) {
        const shape = chordGridShape(chord);
        expect(shape[0]).toEqual({ x: 0, y: 0, interval: 0 });
      }
    });
  });

  describe('chord definitions', () => {
    it('all chords start with 0 (root)', () => {
      for (const chord of Object.values(CHORDS)) {
        expect(chord.intervals[0]).toBe(0);
      }
    });

    it('all chord intervals are ascending', () => {
      for (const [name, chord] of Object.entries(CHORDS)) {
        for (let i = 1; i < chord.intervals.length; i++) {
          expect(chord.intervals[i]!, `${name}[${i}]`).toBeGreaterThan(chord.intervals[i - 1]!);
        }
      }
    });

    it('all intervals within 2 octaves', () => {
      for (const chord of Object.values(CHORDS)) {
        for (const interval of chord.intervals) {
          expect(interval).toBeLessThan(24);
        }
      }
    });
  });
});
