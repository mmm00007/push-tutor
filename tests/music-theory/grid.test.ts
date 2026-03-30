import { describe, it, expect } from 'vitest';
import {
  chromaticMidi, buildGrid, buildPadGrid, buildInKeyGrid, DEFAULT_GRID_CONFIG,
} from '@/lib/music-theory/grid';
import { SCALES } from '@/lib/music-theory/scales';

describe('grid', () => {
  describe('chromaticMidi', () => {
    it('(0,0) with base C1 (36) = C1', () => {
      expect(chromaticMidi(0, 0, 36, 'fourths')).toBe(36);
    });

    it('moving right adds 1 semitone', () => {
      expect(chromaticMidi(1, 0, 36, 'fourths')).toBe(37);
      expect(chromaticMidi(7, 0, 36, 'fourths')).toBe(43);
    });

    it('moving up adds 5 semitones (4ths)', () => {
      expect(chromaticMidi(0, 1, 36, 'fourths')).toBe(41);
      expect(chromaticMidi(0, 2, 36, 'fourths')).toBe(46);
    });

    it('follows formula: base + x + y*5', () => {
      expect(chromaticMidi(3, 2, 36, 'fourths')).toBe(36 + 3 + 2 * 5);
    });

    it('thirds layout: up = +4 semitones', () => {
      expect(chromaticMidi(0, 1, 36, 'thirds')).toBe(40);
    });

    it('sequential layout: up = +8 semitones', () => {
      expect(chromaticMidi(0, 1, 36, 'sequential')).toBe(44);
    });
  });

  describe('buildGrid', () => {
    it('returns 8x8 grid by default', () => {
      const grid = buildGrid(DEFAULT_GRID_CONFIG);
      expect(grid).toHaveLength(8);
      for (const row of grid) {
        expect(row).toHaveLength(8);
      }
    });

    it('bottom-left is base MIDI note', () => {
      const grid = buildGrid(DEFAULT_GRID_CONFIG);
      expect(grid[0]![0]).toBe(36); // C1
    });

    it('top-right has highest note', () => {
      const grid = buildGrid(DEFAULT_GRID_CONFIG);
      const topRight = grid[7]![7];
      // base(36) + 7 + 7*5 = 36 + 7 + 35 = 78
      expect(topRight).toBe(78);
    });

    it('null for out-of-range MIDI values', () => {
      const config = { ...DEFAULT_GRID_CONFIG, baseMidi: 124 };
      const grid = buildGrid(config);
      // Some top-right values should be null (>127)
      const topRight = grid[7]![7];
      expect(topRight).toBeNull();
    });
  });

  describe('buildPadGrid', () => {
    it('marks root notes correctly', () => {
      const pads = buildPadGrid({ ...DEFAULT_GRID_CONFIG, rootPitchClass: 0 });
      // (0,0) is C1 (midi 36), pitch class 0 = root
      expect(pads[0]![0]!.isRoot).toBe(true);
      // (1,0) is C#1, not root
      expect(pads[0]![1]!.isRoot).toBe(false);
    });

    it('marks in-scale notes for C major', () => {
      const config = {
        ...DEFAULT_GRID_CONFIG,
        rootPitchClass: 0,
        scale: SCALES['major']!,
      };
      const pads = buildPadGrid(config);
      // C is in C major
      expect(pads[0]![0]!.inScale).toBe(true);
      // C# is not in C major
      expect(pads[0]![1]!.inScale).toBe(false);
      // D is in C major
      expect(pads[0]![2]!.inScale).toBe(true);
    });

    it('all notes are in scale for chromatic', () => {
      const config = {
        ...DEFAULT_GRID_CONFIG,
        scale: SCALES['chromatic']!,
      };
      const pads = buildPadGrid(config);
      for (const row of pads) {
        for (const pad of row) {
          if (pad.midi !== null) {
            expect(pad.inScale).toBe(true);
          }
        }
      }
    });
  });

  describe('buildInKeyGrid', () => {
    it('only contains scale notes', () => {
      const config = {
        ...DEFAULT_GRID_CONFIG,
        scaleMode: 'inKey' as const,
        rootPitchClass: 0,
        scale: SCALES['major']!,
      };
      const grid = buildInKeyGrid(config);
      const scaleIntervals = new Set(SCALES['major']!.intervals);

      for (const row of grid) {
        for (const midi of row) {
          if (midi !== null) {
            const pc = ((midi % 12) + 12) % 12;
            const interval = (pc - 0 + 12) % 12;
            expect(scaleIntervals.has(interval), `MIDI ${midi} (pc ${pc}) should be in C major`).toBe(true);
          }
        }
      }
    });
  });

  describe('octave shift', () => {
    it('shifts grid up by 12 per octave', () => {
      const config0 = { ...DEFAULT_GRID_CONFIG, octaveShift: 0 };
      const config1 = { ...DEFAULT_GRID_CONFIG, octaveShift: 1 };
      const grid0 = buildGrid(config0);
      const grid1 = buildGrid(config1);
      expect(grid1[0]![0]).toBe(grid0[0]![0]! + 12);
    });

    it('shifts grid down', () => {
      const config = { ...DEFAULT_GRID_CONFIG, octaveShift: -1 };
      const grid = buildGrid(config);
      expect(grid[0]![0]).toBe(36 - 12);
    });
  });
});
