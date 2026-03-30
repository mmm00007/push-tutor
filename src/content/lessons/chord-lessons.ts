/**
 * Data-driven chord lessons for Push-style grid.
 * All chord shapes are defined by intervals, making them movable across roots.
 * Grid positions are relative to root position in chromatic 4ths layout.
 */

export interface GridOffset {
  readonly dx: number;
  readonly dy: number;
  readonly label?: string;
}

export interface LessonStep {
  readonly type: 'explain' | 'demonstrate' | 'play' | 'transpose' | 'quiz';
  readonly title: string;
  readonly text: string;
  /** Grid positions to highlight (relative to lesson root). */
  readonly targetShape?: readonly GridOffset[];
  /** Specific root MIDI to demonstrate on, or null for "user choice". */
  readonly rootMidi?: number;
  /** Accepted transposition targets (MIDI roots) for transpose steps. */
  readonly transposeTo?: readonly number[];
}

export interface QuizQuestion {
  readonly prompt: string;
  readonly chordType: string;
  readonly rootPitchClass: number;
  readonly acceptedShape: readonly GridOffset[];
}

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly chordType: string;
  readonly intervals: readonly number[];
  /** Shape on chromatic 4ths grid (dx = right, dy = up from root). */
  readonly gridShape: readonly GridOffset[];
  readonly steps: readonly LessonStep[];
  readonly quizQuestions: readonly QuizQuestion[];
  readonly order: number;
}

/**
 * Grid shape derivation for chromatic 4ths:
 * midi = base + x + (y * 5)
 * For interval `i`: we need x + 5y = i
 * We pick compact shapes (small hand span).
 */

// Major triad: 0, 4, 7 → (0,0), (4,0), (2,1)  [7=2+5*1]
const MAJOR_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 4, dy: 0, label: 'Major 3rd' },
  { dx: 2, dy: 1, label: '5th' },
];

// Minor triad: 0, 3, 7 → (0,0), (3,0), (2,1)
const MINOR_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 3, dy: 0, label: 'Minor 3rd' },
  { dx: 2, dy: 1, label: '5th' },
];

// Power chord: 0, 7 → (0,0), (2,1)
const POWER_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 2, dy: 1, label: '5th' },
];

// Sus2: 0, 2, 7 → (0,0), (2,0), (2,1)
const SUS2_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 2, dy: 0, label: '2nd' },
  { dx: 2, dy: 1, label: '5th' },
];

// Sus4: 0, 5, 7 → (0,0), (0,1), (2,1)  [5=0+5*1]
const SUS4_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 0, dy: 1, label: '4th' },
  { dx: 2, dy: 1, label: '5th' },
];

// Major 7: 0, 4, 7, 11 → (0,0), (4,0), (2,1), (1,2)  [11=1+5*2]
const MAJ7_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 4, dy: 0, label: 'Major 3rd' },
  { dx: 2, dy: 1, label: '5th' },
  { dx: 1, dy: 2, label: 'Major 7th' },
];

// Minor 7: 0, 3, 7, 10 → (0,0), (3,0), (2,1), (0,2)  [10=0+5*2]
const MIN7_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 3, dy: 0, label: 'Minor 3rd' },
  { dx: 2, dy: 1, label: '5th' },
  { dx: 0, dy: 2, label: 'Minor 7th' },
];

// Dominant 7: 0, 4, 7, 10 → (0,0), (4,0), (2,1), (0,2)
const DOM7_SHAPE: GridOffset[] = [
  { dx: 0, dy: 0, label: 'Root' },
  { dx: 4, dy: 0, label: 'Major 3rd' },
  { dx: 2, dy: 1, label: '5th' },
  { dx: 0, dy: 2, label: 'Minor 7th' },
];

export const LESSONS: Lesson[] = [
  {
    id: 'power-chord',
    title: 'Power Chord',
    subtitle: 'The simplest shape',
    description: 'Just two notes — root and fifth. The most universal chord shape in music.',
    chordType: 'power',
    intervals: [0, 7],
    gridShape: POWER_SHAPE,
    order: 1,
    steps: [
      {
        type: 'explain',
        title: 'What is a Power Chord?',
        text: 'A power chord is the simplest chord — just the root note and the fifth. It has no major or minor quality, so it sounds strong and neutral. On the grid, the fifth is always 2 pads right and 1 pad up from the root.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'Here\'s the power chord shape on the grid. The highlighted pads show where to press. This exact shape works from ANY root note!',
        targetShape: POWER_SHAPE,
        rootMidi: 48, // C2
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Press both highlighted pads at the same time to hear the power chord. Try pressing them one at a time first, then together.',
        targetShape: POWER_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Now move the same shape to a different root. The shape stays exactly the same — just start from a different pad.',
        targetShape: POWER_SHAPE,
        transposeTo: [50, 53, 55], // D2, F2, G2
      },
    ],
    quizQuestions: [
      { prompt: 'Play a C power chord', chordType: 'power', rootPitchClass: 0, acceptedShape: POWER_SHAPE },
      { prompt: 'Play a G power chord', chordType: 'power', rootPitchClass: 7, acceptedShape: POWER_SHAPE },
      { prompt: 'Play an E power chord', chordType: 'power', rootPitchClass: 4, acceptedShape: POWER_SHAPE },
    ],
  },
  {
    id: 'major-triad',
    title: 'Major Triad',
    subtitle: 'The happy chord',
    description: 'Three notes that define the bright, happy sound of major chords.',
    chordType: 'major',
    intervals: [0, 4, 7],
    gridShape: MAJOR_SHAPE,
    order: 2,
    steps: [
      {
        type: 'explain',
        title: 'What is a Major Triad?',
        text: 'A major triad has three notes: root, major third, and fifth. It sounds bright and happy. On the grid, the third is 4 pads right, and the fifth is 2 right + 1 up.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'This is the major triad shape. Notice how it forms an easy triangle pattern. This shape is the same everywhere on the grid!',
        targetShape: MAJOR_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Press all three pads to hear the major chord. Try adding one note at a time: root first, then the third, then the fifth.',
        targetShape: MAJOR_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Play the same major triad shape starting from different roots.',
        targetShape: MAJOR_SHAPE,
        transposeTo: [50, 53, 55],
      },
    ],
    quizQuestions: [
      { prompt: 'Play C major', chordType: 'major', rootPitchClass: 0, acceptedShape: MAJOR_SHAPE },
      { prompt: 'Play F major', chordType: 'major', rootPitchClass: 5, acceptedShape: MAJOR_SHAPE },
      { prompt: 'Play A major', chordType: 'major', rootPitchClass: 9, acceptedShape: MAJOR_SHAPE },
    ],
  },
  {
    id: 'minor-triad',
    title: 'Minor Triad',
    subtitle: 'The sad chord',
    description: 'Just one note different from major — but a completely different mood.',
    chordType: 'minor',
    intervals: [0, 3, 7],
    gridShape: MINOR_SHAPE,
    order: 3,
    steps: [
      {
        type: 'explain',
        title: 'What is a Minor Triad?',
        text: 'A minor triad uses root, minor third, and fifth. Compared to major, the third is one pad closer to the root (3 right instead of 4). This one change makes it sound sad or moody.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'Compare this to the major shape — the only difference is the third is 3 pads right instead of 4. The fifth stays in the same place.',
        targetShape: MINOR_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Play the minor chord, then switch to major by moving the third one pad right. Hear the difference?',
        targetShape: MINOR_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Play minor triads on different roots. The shape is always the same.',
        targetShape: MINOR_SHAPE,
        transposeTo: [50, 52, 55],
      },
    ],
    quizQuestions: [
      { prompt: 'Play A minor', chordType: 'minor', rootPitchClass: 9, acceptedShape: MINOR_SHAPE },
      { prompt: 'Play D minor', chordType: 'minor', rootPitchClass: 2, acceptedShape: MINOR_SHAPE },
      { prompt: 'Play E minor', chordType: 'minor', rootPitchClass: 4, acceptedShape: MINOR_SHAPE },
    ],
  },
  {
    id: 'sus2',
    title: 'Suspended 2nd',
    subtitle: 'Open and floating',
    description: 'Replace the third with the second for an open, unresolved sound.',
    chordType: 'sus2',
    intervals: [0, 2, 7],
    gridShape: SUS2_SHAPE,
    order: 4,
    steps: [
      {
        type: 'explain',
        title: 'What is a Sus2?',
        text: 'A sus2 chord replaces the third with the second. It\'s neither major nor minor — it sounds open and floaty. On the grid: root, 2 right, then 2 right + 1 up.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'Notice the second and fifth line up vertically. This is a very compact, easy shape.',
        targetShape: SUS2_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Play the sus2, then try switching to major or minor by moving the middle note.',
        targetShape: SUS2_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Play sus2 chords on different roots.',
        targetShape: SUS2_SHAPE,
        transposeTo: [50, 53, 55],
      },
    ],
    quizQuestions: [
      { prompt: 'Play C sus2', chordType: 'sus2', rootPitchClass: 0, acceptedShape: SUS2_SHAPE },
      { prompt: 'Play G sus2', chordType: 'sus2', rootPitchClass: 7, acceptedShape: SUS2_SHAPE },
    ],
  },
  {
    id: 'sus4',
    title: 'Suspended 4th',
    subtitle: 'Tense and dramatic',
    description: 'Replace the third with the fourth for a tense, wanting-to-resolve sound.',
    chordType: 'sus4',
    intervals: [0, 5, 7],
    gridShape: SUS4_SHAPE,
    order: 5,
    steps: [
      {
        type: 'explain',
        title: 'What is a Sus4?',
        text: 'A sus4 replaces the third with the fourth. It sounds tense — like it wants to move somewhere. On the grid, the fourth is directly above the root (1 pad up).',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'The fourth sits right above the root. The fifth is 2 right from the fourth. Very compact shape.',
        targetShape: SUS4_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Play the sus4. Try resolving it by moving the fourth down one pad (to the major third) — hear how it relaxes?',
        targetShape: SUS4_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Play sus4 chords on different roots.',
        targetShape: SUS4_SHAPE,
        transposeTo: [50, 53, 55],
      },
    ],
    quizQuestions: [
      { prompt: 'Play D sus4', chordType: 'sus4', rootPitchClass: 2, acceptedShape: SUS4_SHAPE },
      { prompt: 'Play A sus4', chordType: 'sus4', rootPitchClass: 9, acceptedShape: SUS4_SHAPE },
    ],
  },
  {
    id: 'major7',
    title: 'Major 7th',
    subtitle: 'Smooth and jazzy',
    description: 'Add a major 7th to the major triad for a rich, sophisticated sound.',
    chordType: 'major7',
    intervals: [0, 4, 7, 11],
    gridShape: MAJ7_SHAPE,
    order: 6,
    steps: [
      {
        type: 'explain',
        title: 'What is a Major 7th?',
        text: 'A major 7th adds the note one semitone below the octave on top of a major triad. It sounds smooth, dreamy, and jazzy. Four notes, but the shape is still manageable.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'Start with the major triad shape you know, then add the 7th: 1 right + 2 up from root.',
        targetShape: MAJ7_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Build it up: play the major triad first, then add the 7th. Notice how it changes the character.',
        targetShape: MAJ7_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Move the major 7th shape to new roots.',
        targetShape: MAJ7_SHAPE,
        transposeTo: [50, 53],
      },
    ],
    quizQuestions: [
      { prompt: 'Play C major 7', chordType: 'major7', rootPitchClass: 0, acceptedShape: MAJ7_SHAPE },
      { prompt: 'Play F major 7', chordType: 'major7', rootPitchClass: 5, acceptedShape: MAJ7_SHAPE },
    ],
  },
  {
    id: 'minor7',
    title: 'Minor 7th',
    subtitle: 'Warm and mellow',
    description: 'A minor triad with a minor 7th — warm, expressive, and versatile.',
    chordType: 'minor7',
    intervals: [0, 3, 7, 10],
    gridShape: MIN7_SHAPE,
    order: 7,
    steps: [
      {
        type: 'explain',
        title: 'What is a Minor 7th?',
        text: 'Minor 7th = minor triad + minor 7th on top. It\'s warm, mellow, and one of the most used chords in jazz, R&B, and lo-fi. The 7th sits directly 2 rows above the root.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'Start from the minor triad, then add the 7th straight up (2 rows above root, same column).',
        targetShape: MIN7_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Play the minor 7th. Compare it to the plain minor triad — the 7th adds depth.',
        targetShape: MIN7_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Play minor 7th chords on different roots.',
        targetShape: MIN7_SHAPE,
        transposeTo: [50, 53],
      },
    ],
    quizQuestions: [
      { prompt: 'Play A minor 7', chordType: 'minor7', rootPitchClass: 9, acceptedShape: MIN7_SHAPE },
      { prompt: 'Play D minor 7', chordType: 'minor7', rootPitchClass: 2, acceptedShape: MIN7_SHAPE },
    ],
  },
  {
    id: 'dominant7',
    title: 'Dominant 7th',
    subtitle: 'Bluesy and bold',
    description: 'A major triad with a minor 7th — the classic blues and rock chord.',
    chordType: 'dominant7',
    intervals: [0, 4, 7, 10],
    gridShape: DOM7_SHAPE,
    order: 8,
    steps: [
      {
        type: 'explain',
        title: 'What is a Dominant 7th?',
        text: 'Dominant 7th = major triad + minor 7th. It\'s the "tension" chord in blues, rock, and funk. It sounds like it wants to resolve — that tension is what gives it character.',
      },
      {
        type: 'demonstrate',
        title: 'See the Shape',
        text: 'Same as major 7th but the 7th is one semitone lower (directly 2 rows up from root). Compare the two shapes!',
        targetShape: DOM7_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'play',
        title: 'Play It',
        text: 'Play the dominant 7th. Try alternating between this and the major 7th to hear the difference.',
        targetShape: DOM7_SHAPE,
        rootMidi: 48,
      },
      {
        type: 'transpose',
        title: 'Move the Shape',
        text: 'Play dominant 7th chords on different roots.',
        targetShape: DOM7_SHAPE,
        transposeTo: [50, 55],
      },
    ],
    quizQuestions: [
      { prompt: 'Play G7', chordType: 'dominant7', rootPitchClass: 7, acceptedShape: DOM7_SHAPE },
      { prompt: 'Play C7', chordType: 'dominant7', rootPitchClass: 0, acceptedShape: DOM7_SHAPE },
    ],
  },
];
