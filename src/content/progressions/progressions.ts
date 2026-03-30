/**
 * Sade-style chord progressions for the Push grid.
 *
 * Sade's harmonic language is built on:
 * - Minor 7th and 9th chords as foundation
 * - Major 7th chords for warmth and resolution
 * - Minimal progressions (often just 2-3 chords looping)
 * - Smooth voice leading between chords
 * - Neo-soul / smooth jazz vocabulary
 *
 * All chords defined by root pitch class + intervals.
 * Grid positions derived from chromatic 4ths: midi = base + dx + dy*5
 */

import type { GridOffset } from '../lessons/chord-lessons';

export interface ProgressionChord {
  /** Display name like "Cm7" */
  readonly name: string;
  /** Root pitch class 0–11 */
  readonly rootPitchClass: number;
  /** Intervals from root in semitones */
  readonly intervals: readonly number[];
  /** Grid shape for chromatic 4ths (dx + dy*5 = interval) */
  readonly shape: readonly GridOffset[];
  /** Duration in beats (at the progression's tempo) */
  readonly beats: number;
}

export interface Progression {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly song: string;
  readonly description: string;
  readonly tempo: number;
  readonly chords: readonly ProgressionChord[];
}

// --- Reusable chord shapes on chromatic 4ths grid ---
// minor 7: [0, 3, 7, 10] → (0,0), (3,0), (2,1), (0,2)
const MIN7: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 3, dy: 0, label: 'm3' },
  { dx: 2, dy: 1, label: '5' },
  { dx: 0, dy: 2, label: 'm7' },
];

// major 7: [0, 4, 7, 11] → (0,0), (4,0), (2,1), (1,2)
const MAJ7: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 4, dy: 0, label: 'M3' },
  { dx: 2, dy: 1, label: '5' },
  { dx: 1, dy: 2, label: 'M7' },
];

// minor 9: [0, 3, 7, 10, 14] → (0,0), (3,0), (2,1), (0,2), (4,2)
// 14 semitones = 4 + 2*5
const MIN9: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 3, dy: 0, label: 'm3' },
  { dx: 2, dy: 1, label: '5' },
  { dx: 0, dy: 2, label: 'm7' },
  { dx: 4, dy: 2, label: '9' },
];

// major 9: [0, 4, 7, 11, 14] → (0,0), (4,0), (2,1), (1,2), (4,2)
const MAJ9: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 4, dy: 0, label: 'M3' },
  { dx: 2, dy: 1, label: '5' },
  { dx: 1, dy: 2, label: 'M7' },
  { dx: 4, dy: 2, label: '9' },
];

// dominant 7: [0, 4, 7, 10] → (0,0), (4,0), (2,1), (0,2)
const DOM7: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 4, dy: 0, label: 'M3' },
  { dx: 2, dy: 1, label: '5' },
  { dx: 0, dy: 2, label: 'm7' },
];

// sus4: [0, 5, 7] → (0,0), (0,1), (2,1)
const SUS4: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 0, dy: 1, label: '4' },
  { dx: 2, dy: 1, label: '5' },
];

// minor: [0, 3, 7] → (0,0), (3,0), (2,1)
const MINOR: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 3, dy: 0, label: 'm3' },
  { dx: 2, dy: 1, label: '5' },
];

// major: [0, 4, 7] → (0,0), (4,0), (2,1)
const MAJOR: GridOffset[] = [
  { dx: 0, dy: 0, label: 'R' },
  { dx: 4, dy: 0, label: 'M3' },
  { dx: 2, dy: 1, label: '5' },
];

export const PROGRESSIONS: Progression[] = [
  {
    id: 'smooth-operator',
    title: 'Smooth Operator',
    artist: 'Sade',
    song: 'Smooth Operator',
    description: 'The quintessential Sade groove — just two minor 7th chords trading back and forth. Hypnotic in its simplicity.',
    tempo: 100,
    chords: [
      { name: 'C#m7', rootPitchClass: 1, intervals: [0, 3, 7, 10], shape: MIN7, beats: 8 },
      { name: 'F#m7', rootPitchClass: 6, intervals: [0, 3, 7, 10], shape: MIN7, beats: 8 },
    ],
  },
  {
    id: 'no-ordinary-love',
    title: 'No Ordinary Love',
    artist: 'Sade',
    song: 'No Ordinary Love',
    description: 'Dark, cinematic minor chords with a major 7th resolution. The Bbm to Gb movement defines Sade\'s melancholic side.',
    tempo: 84,
    chords: [
      { name: 'Bbm7', rootPitchClass: 10, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Ebm7', rootPitchClass: 3, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Abmaj7', rootPitchClass: 8, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'Gb', rootPitchClass: 6, intervals: [0, 4, 7], shape: MAJOR, beats: 4 },
    ],
  },
  {
    id: 'sweetest-taboo',
    title: 'The Sweetest Taboo',
    artist: 'Sade',
    song: 'The Sweetest Taboo',
    description: 'Warm descending major 7th movement. The Fmaj7 to Em7 step-down is pure Sade sophistication.',
    tempo: 96,
    chords: [
      { name: 'Fmaj7', rootPitchClass: 5, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'Em7', rootPitchClass: 4, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Am9', rootPitchClass: 9, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 8 },
    ],
  },
  {
    id: 'your-love-is-king',
    title: 'Your Love Is King',
    artist: 'Sade',
    song: 'Your Love Is King',
    description: 'Ascending diatonic movement through major and minor 7ths. The chord walk upward gives this song its regal lift.',
    tempo: 108,
    chords: [
      { name: 'Fmaj7', rootPitchClass: 5, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'Gm7', rootPitchClass: 7, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Am7', rootPitchClass: 9, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Bbmaj7', rootPitchClass: 10, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
    ],
  },
  {
    id: 'kiss-of-life',
    title: 'Kiss of Life',
    artist: 'Sade',
    song: 'Kiss of Life',
    description: 'Classic ii-V-I jazz movement with 9th extensions. Sade at her most jazz-forward.',
    tempo: 112,
    chords: [
      { name: 'Am9', rootPitchClass: 9, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'Dm9', rootPitchClass: 2, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'G7', rootPitchClass: 7, intervals: [0, 4, 7, 10], shape: DOM7, beats: 4 },
      { name: 'Cmaj9', rootPitchClass: 0, intervals: [0, 4, 7, 11, 14], shape: MAJ9, beats: 4 },
    ],
  },
  {
    id: 'by-your-side',
    title: 'By Your Side',
    artist: 'Sade',
    song: 'By Your Side',
    description: 'Warm, enveloping major 7th chords. Minimal movement, maximum emotional resonance.',
    tempo: 92,
    chords: [
      { name: 'Dbmaj7', rootPitchClass: 1, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 8 },
      { name: 'Cm7', rootPitchClass: 0, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Fm7', rootPitchClass: 5, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
    ],
  },

  // --- Neo-Soul Classics ---

  {
    id: 'erykah-tyrone',
    title: 'Tyrone',
    artist: 'Erykah Badu',
    song: 'Tyrone',
    description: 'Sparse minor groove anchored by a two-chord vamp. The space between the chords is the whole vibe.',
    tempo: 88,
    chords: [
      { name: 'Gm7', rootPitchClass: 7, intervals: [0, 3, 7, 10], shape: MIN7, beats: 8 },
      { name: 'Cm7', rootPitchClass: 0, intervals: [0, 3, 7, 10], shape: MIN7, beats: 8 },
    ],
  },
  {
    id: 'erykah-on-and-on',
    title: 'On & On',
    artist: 'Erykah Badu',
    song: 'On & On',
    description: 'Dreamy minor 9ths floating over a laid-back groove. The blueprint for neo-soul harmony.',
    tempo: 82,
    chords: [
      { name: 'Am9', rootPitchClass: 9, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 8 },
      { name: 'Em9', rootPitchClass: 4, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 8 },
    ],
  },
  {
    id: 'dangelo-untitled',
    title: 'Untitled (How Does It Feel)',
    artist: 'D\'Angelo',
    song: 'Untitled (How Does It Feel)',
    description: 'Slow-burn chromatic descending movement through minor 7ths. Every chord melts into the next.',
    tempo: 68,
    chords: [
      { name: 'Dm9', rootPitchClass: 2, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 8 },
      { name: 'C#m9', rootPitchClass: 1, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'Cm9', rootPitchClass: 0, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'Bm9', rootPitchClass: 11, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 8 },
    ],
  },
  {
    id: 'dangelo-brown-sugar',
    title: 'Brown Sugar',
    artist: 'D\'Angelo',
    song: 'Brown Sugar',
    description: 'Classic ii-V-I neo-soul with 9th extensions and a lush major 9 resolution.',
    tempo: 98,
    chords: [
      { name: 'Em9', rootPitchClass: 4, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'A7', rootPitchClass: 9, intervals: [0, 4, 7, 10], shape: DOM7, beats: 4 },
      { name: 'Dmaj9', rootPitchClass: 2, intervals: [0, 4, 7, 11, 14], shape: MAJ9, beats: 8 },
    ],
  },
  {
    id: 'lauryn-everything',
    title: 'Everything Is Everything',
    artist: 'Lauryn Hill',
    song: 'Everything Is Everything',
    description: 'Bright piano-driven progression with major 7th warmth. Uplifting and rhythmic.',
    tempo: 100,
    chords: [
      { name: 'Bbmaj7', rootPitchClass: 10, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'Am7', rootPitchClass: 9, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Gm7', rootPitchClass: 7, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Fmaj7', rootPitchClass: 5, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
    ],
  },
  {
    id: 'jill-scott-golden',
    title: 'Golden',
    artist: 'Jill Scott',
    song: 'Golden',
    description: 'Radiant ascending progression. Major 7ths and sus chords create a feeling of pure joy.',
    tempo: 104,
    chords: [
      { name: 'Ebmaj7', rootPitchClass: 3, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'Fm7', rootPitchClass: 5, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Gsus4', rootPitchClass: 7, intervals: [0, 5, 7], shape: SUS4, beats: 4 },
      { name: 'Abmaj7', rootPitchClass: 8, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
    ],
  },
  {
    id: 'musiq-love',
    title: 'Love',
    artist: 'Musiq Soulchild',
    song: 'Love',
    description: 'Smooth R&B cycle of minor and major 7ths. The dominant 7 at the end pulls you back to the top.',
    tempo: 78,
    chords: [
      { name: 'Cm9', rootPitchClass: 0, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'Fm9', rootPitchClass: 5, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 4 },
      { name: 'Bbmaj7', rootPitchClass: 10, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'G7', rootPitchClass: 7, intervals: [0, 4, 7, 10], shape: DOM7, beats: 4 },
    ],
  },
  {
    id: 'maxwell-ascension',
    title: 'Ascension (Don\'t Ever Wonder)',
    artist: 'Maxwell',
    song: 'Ascension (Don\'t Ever Wonder)',
    description: 'Ethereal minor 9th vamp with a major 7th lift. Maxwell at his most atmospheric.',
    tempo: 90,
    chords: [
      { name: 'Ebm9', rootPitchClass: 3, intervals: [0, 3, 7, 10, 14], shape: MIN9, beats: 8 },
      { name: 'Dbmaj7', rootPitchClass: 1, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'Gbmaj7', rootPitchClass: 6, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
    ],
  },
  {
    id: 'india-arie-ready',
    title: 'Ready for Love',
    artist: 'India.Arie',
    song: 'Ready for Love',
    description: 'Gentle acoustic soul. Warm descending major and minor 7ths with a sus resolution.',
    tempo: 86,
    chords: [
      { name: 'Gmaj7', rootPitchClass: 7, intervals: [0, 4, 7, 11], shape: MAJ7, beats: 4 },
      { name: 'F#m7', rootPitchClass: 6, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Em7', rootPitchClass: 4, intervals: [0, 3, 7, 10], shape: MIN7, beats: 4 },
      { name: 'Dsus4', rootPitchClass: 2, intervals: [0, 5, 7], shape: SUS4, beats: 4 },
    ],
  },
];
