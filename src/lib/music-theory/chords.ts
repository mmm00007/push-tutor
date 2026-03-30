/** Chord definitions using interval patterns. Shapes are grid-relative for Push-style layouts. */

export interface ChordDefinition {
  readonly name: string;
  readonly shortName: string;
  readonly intervals: readonly number[];
  readonly description: string;
}

/** Built-in chord types defined by intervals from root. */
export const CHORDS: Record<string, ChordDefinition> = {
  major: {
    name: 'Major Triad',
    shortName: 'maj',
    intervals: [0, 4, 7],
    description: 'Bright, happy sound. The most common chord type.',
  },
  minor: {
    name: 'Minor Triad',
    shortName: 'min',
    intervals: [0, 3, 7],
    description: 'Darker, sadder sound. One semitone difference from major.',
  },
  power: {
    name: 'Power Chord',
    shortName: '5',
    intervals: [0, 7],
    description: 'Root and fifth only. No major or minor quality. Used in rock and electronic music.',
  },
  sus2: {
    name: 'Suspended 2nd',
    shortName: 'sus2',
    intervals: [0, 2, 7],
    description: 'Open, ambiguous sound. The third is replaced by the second.',
  },
  sus4: {
    name: 'Suspended 4th',
    shortName: 'sus4',
    intervals: [0, 5, 7],
    description: 'Tense, wanting to resolve. The third is replaced by the fourth.',
  },
  major7: {
    name: 'Major 7th',
    shortName: 'maj7',
    intervals: [0, 4, 7, 11],
    description: 'Smooth, jazzy sound. A major triad with a major 7th on top.',
  },
  minor7: {
    name: 'Minor 7th',
    shortName: 'min7',
    intervals: [0, 3, 7, 10],
    description: 'Warm, mellow sound. A minor triad with a minor 7th.',
  },
  dominant7: {
    name: 'Dominant 7th',
    shortName: '7',
    intervals: [0, 4, 7, 10],
    description: 'Bluesy, tense sound that wants to resolve. Major triad with minor 7th.',
  },
};

export const CHORD_KEYS = Object.keys(CHORDS) as readonly (keyof typeof CHORDS)[];

/** Get MIDI notes for a chord rooted at a given MIDI note. */
export function chordNotes(rootMidi: number, chord: ChordDefinition): number[] {
  return chord.intervals.map(i => rootMidi + i);
}

/**
 * Compute grid positions (x, y offsets from root) for a chord shape
 * in chromatic 4ths layout. Each interval maps to positions on the grid
 * where that note can be found near the root.
 *
 * In 4ths chromatic: midi = baseMidi + x + (y * 5)
 * So for an interval `i` semitones above root at (0,0):
 *   x + 5y = i
 *   We want the most compact shape (smallest span).
 */
export interface GridPosition {
  readonly x: number;
  readonly y: number;
  readonly interval: number;
}

export function chordGridShape(chord: ChordDefinition, rowInterval = 5): GridPosition[] {
  return chord.intervals.map(interval => {
    // Find the best grid position for each interval.
    // Prefer non-negative x (right-handed shapes) and minimize row distance.
    // For Push-style playing, staying in the same row is preferred for small intervals
    // and moving up rows for larger ones.
    let bestX = interval;
    let bestY = 0;
    let bestScore = scorePosition(interval, 0);

    for (let y = 0; y <= 3; y++) {
      const x = interval - y * rowInterval;
      if (x >= 0 && x <= 7) {
        const score = scorePosition(x, y);
        if (score < bestScore) {
          bestX = x;
          bestY = y;
          bestScore = score;
        }
      }
    }

    return { x: bestX, y: bestY, interval };
  });
}

/** Score a position: lower is better. Prefers small x, small y, non-negative x. */
function scorePosition(x: number, y: number): number {
  // Penalize negative x heavily (we want right-handed shapes)
  if (x < 0) return 100 + Math.abs(x) + y;
  // Score: weighted sum favoring small total reach
  return x + y * 3;
}

/** Get all grid positions where a chord shape fits, given a root position on the grid. */
export function chordPositionsOnGrid(
  rootX: number,
  rootY: number,
  shape: GridPosition[],
  gridSize = 8,
): { x: number; y: number; interval: number }[] {
  return shape
    .map(pos => ({
      x: rootX + pos.x,
      y: rootY + pos.y,
      interval: pos.interval,
    }))
    .filter(pos => pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize);
}
