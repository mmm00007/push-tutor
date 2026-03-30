import { describe, it, expect } from 'vitest';
import { SCALES, scaleNotes, isInScale, isRoot, scaleDegree } from '@/lib/music-theory/scales';

describe('scales', () => {
  describe('scaleNotes', () => {
    it('C major contains correct pitch classes', () => {
      const notes = scaleNotes(0, SCALES['major']!);
      expect(notes).toEqual(new Set([0, 2, 4, 5, 7, 9, 11]));
    });

    it('A natural minor contains correct pitch classes', () => {
      const notes = scaleNotes(9, SCALES['naturalMinor']!);
      // A=9, B=11, C=0, D=2, E=4, F=5, G=7
      expect(notes).toEqual(new Set([9, 11, 0, 2, 4, 5, 7]));
    });

    it('chromatic contains all 12 pitch classes', () => {
      const notes = scaleNotes(0, SCALES['chromatic']!);
      expect(notes.size).toBe(12);
    });

    it('major pentatonic has 5 notes', () => {
      const notes = scaleNotes(0, SCALES['majorPentatonic']!);
      expect(notes.size).toBe(5);
      expect(notes).toEqual(new Set([0, 2, 4, 7, 9]));
    });
  });

  describe('isInScale', () => {
    it('C is in C major', () => {
      expect(isInScale(60, 0, SCALES['major']!)).toBe(true);
    });

    it('C# is not in C major', () => {
      expect(isInScale(61, 0, SCALES['major']!)).toBe(false);
    });

    it('D is in C major', () => {
      expect(isInScale(62, 0, SCALES['major']!)).toBe(true);
    });

    it('works across octaves', () => {
      expect(isInScale(48, 0, SCALES['major']!)).toBe(true); // C2
      expect(isInScale(72, 0, SCALES['major']!)).toBe(true); // C4
    });
  });

  describe('isRoot', () => {
    it('C (midi 60) is root of C', () => {
      expect(isRoot(60, 0)).toBe(true);
    });

    it('D (midi 62) is not root of C', () => {
      expect(isRoot(62, 0)).toBe(false);
    });

    it('works across octaves', () => {
      expect(isRoot(36, 0)).toBe(true);  // C1
      expect(isRoot(48, 0)).toBe(true);  // C2
      expect(isRoot(72, 0)).toBe(true);  // C4
    });
  });

  describe('scaleDegree', () => {
    it('root = degree 0', () => {
      expect(scaleDegree(60, 0, SCALES['major']!)).toBe(0);
    });

    it('fifth = degree 4 in major', () => {
      expect(scaleDegree(67, 0, SCALES['major']!)).toBe(4); // G in C major
    });

    it('returns -1 for notes outside scale', () => {
      expect(scaleDegree(61, 0, SCALES['major']!)).toBe(-1); // C# not in C major
    });
  });

  describe('scale definitions', () => {
    it('all scales have valid interval patterns', () => {
      for (const [key, scale] of Object.entries(SCALES)) {
        expect(scale.intervals[0], `${key} starts at 0`).toBe(0);
        for (let i = 1; i < scale.intervals.length; i++) {
          expect(scale.intervals[i]!, `${key} interval ${i} ascending`)
            .toBeGreaterThan(scale.intervals[i - 1]!);
        }
        const last = scale.intervals[scale.intervals.length - 1]!;
        expect(last, `${key} within octave`).toBeLessThan(12);
      }
    });
  });
});
