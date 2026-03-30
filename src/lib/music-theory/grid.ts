/**
 * Grid mapping for Push-style note layouts.
 *
 * Chromatic 4ths (default):
 *   midi = baseMidi + x + (y * rowInterval)
 *   rowInterval = 5 for 4ths, 4 for 3rds, 8 for sequential (one octave per row minus overlap)
 *
 * In Key mode:
 *   Only scale notes are placed on the grid. Moving right = next scale degree.
 *   Moving up = scale degree + scaleDegreesPerRow (typically 3 or 4).
 */

import { type ScaleDefinition, isInScale, isRoot } from './scales';

export type LayoutMode = 'fourths' | 'thirds' | 'sequential';
export type ScaleMode = 'chromatic' | 'inKey';

export const ROW_INTERVALS: Record<LayoutMode, number> = {
  fourths: 5,
  thirds: 4,
  sequential: 8,
};

export type VisibleRows = 4 | 5 | 6 | 7 | 8;

export interface GridConfig {
  readonly baseMidi: number;      // MIDI note at bottom-left (0,0)
  readonly gridSize: number;      // always 8 columns
  readonly visibleRows: VisibleRows; // 4–8 rows shown (zoom)
  readonly layout: LayoutMode;    // 4ths, 3rds, sequential
  readonly scaleMode: ScaleMode;  // chromatic or inKey
  readonly rootPitchClass: number; // 0=C, 1=C#, ... 11=B
  readonly scale: ScaleDefinition;
  readonly octaveShift: number;    // +/- octaves from default
}

/**
 * Default: Chromatic 4ths for this app (chord shape tutor).
 * Note: Push 3 defaults to In Key mode. We default to Chromatic because
 * this app specifically teaches chromatic-mode chord shapes to beginners.
 * The default scale is Major (matching Push 3), so In Key mode works correctly
 * when users switch to it.
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  baseMidi: 36,        // C1 (MIDI 36)
  gridSize: 8,
  visibleRows: 8,
  layout: 'fourths',
  scaleMode: 'chromatic',
  rootPitchClass: 0,   // C
  scale: { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  octaveShift: 0,
};

/** Get MIDI note for a chromatic grid position. */
export function chromaticMidi(x: number, y: number, baseMidi: number, layout: LayoutMode): number {
  return baseMidi + x + y * ROW_INTERVALS[layout];
}

/**
 * Build the In Key grid: only scale degrees placed on pads.
 * Returns a 2D array [y][x] of MIDI values (or null if pad has no note).
 *
 * In Key mode on Push:
 * - Each row shifts by a fixed number of scale degrees (typically 3 for 4ths-like feel)
 * - Moving right = next scale degree
 * - Moving up = skip some scale degrees
 */
export function buildInKeyGrid(config: GridConfig): (number | null)[][] {
  const { scale, rootPitchClass, gridSize, octaveShift } = config;
  const degrees = scale.intervals;
  // Degrees-per-row approximates the interval feel within the scale:
  // 4ths: 3 degrees for 7-note scales (≈ perfect fourth), 2 for pentatonic
  // 3rds: 2 degrees for 7-note scales (≈ major third)
  // Sequential: full row width (8) — no vertical offset, pure linear progression
  const baseDegrees = config.layout === 'fourths' ? 3 : config.layout === 'thirds' ? 2 : gridSize;
  // Adjust for pentatonic/smaller scales in 4ths mode
  const degreesPerRow = (config.layout === 'fourths' && degrees.length <= 5) ? 2 : baseDegrees;

  // Base octave: start from rootPitchClass in a reasonable octave
  const baseOctaveMidi = (3 + octaveShift) * 12 + rootPitchClass;

  const rows = config.visibleRows ?? gridSize;
  const grid: (number | null)[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: (number | null)[] = [];
    for (let x = 0; x < gridSize; x++) {
      const degreeIndex = x + y * degreesPerRow;
      const octaveOffset = Math.floor(degreeIndex / degrees.length);
      const degreeInScale = degreeIndex % degrees.length;
      const interval = degrees[degreeInScale];
      if (interval !== undefined) {
        const midi = baseOctaveMidi + octaveOffset * 12 + interval;
        row.push(midi >= 0 && midi <= 127 ? midi : null);
      } else {
        row.push(null);
      }
    }
    grid.push(row);
  }
  return grid;
}

/** Build the full grid as a 2D array [y][x] of MIDI values.
 *  Only `visibleRows` rows are generated (zoom feature). */
export function buildGrid(config: GridConfig): (number | null)[][] {
  if (config.scaleMode === 'inKey') {
    return buildInKeyGrid(config);
  }

  const { gridSize, visibleRows, layout, octaveShift } = config;
  const rows = visibleRows ?? gridSize;
  const baseMidi = config.baseMidi + octaveShift * 12;
  const grid: (number | null)[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: (number | null)[] = [];
    for (let x = 0; x < gridSize; x++) {
      const midi = chromaticMidi(x, y, baseMidi, layout);
      row.push(midi >= 0 && midi <= 127 ? midi : null);
    }
    grid.push(row);
  }
  return grid;
}

export interface PadInfo {
  readonly x: number;
  readonly y: number;
  readonly midi: number | null;
  readonly isRoot: boolean;
  readonly inScale: boolean;
}

/** Get full pad info for the grid. */
export function buildPadGrid(config: GridConfig): PadInfo[][] {
  const midiGrid = buildGrid(config);
  return midiGrid.map((row, y) =>
    row.map((midi, x) => ({
      x,
      y,
      midi,
      isRoot: midi !== null && isRoot(midi, config.rootPitchClass),
      inScale: midi !== null && isInScale(midi, config.rootPitchClass, config.scale),
    })),
  );
}
