import { useState, useCallback, useRef, useEffect } from 'react';
import { PROGRESSIONS, type Progression, type ProgressionChord } from '@/content/progressions/progressions';
import { useAudioStore } from '@/stores/audio-store';
import { useGridStore } from '@/stores/grid-store';
import { Grid } from '@/components/Grid/Grid';
import { type PadState } from '@/components/Grid/Pad';
import { noteName } from '@/lib/music-theory/notes';
import type { PadInfo } from '@/lib/music-theory';
import styles from './SongsScreen.module.css';

/**
 * Find the optimal fingering for a chord on the grid.
 * Uses the chord's shape offsets (dx, dy) and tries every possible root
 * position to find the one where the entire shape fits and is most
 * centered / reachable. Returns the primary pad positions.
 */
function findOptimalFingering(
  chord: ProgressionChord,
  pads: PadInfo[][],
  gridSize: number,
  numRows: number,
): { x: number; y: number; midi: number }[] {
  const shape = chord.shape;
  let bestPositions: { x: number; y: number; midi: number }[] = [];
  let bestScore = -Infinity;

  // Try every pad as potential root position
  for (let ry = 0; ry < numRows; ry++) {
    for (let rx = 0; rx < gridSize; rx++) {
      const rootPad = pads[ry]?.[rx];
      if (!rootPad?.midi) continue;
      // Root must match the chord's root pitch class
      if (rootPad.midi % 12 !== chord.rootPitchClass) continue;

      // Check if entire shape fits from this root
      const positions: { x: number; y: number; midi: number }[] = [];
      let fits = true;
      for (const offset of shape) {
        const px = rx + offset.dx;
        const py = ry + offset.dy;
        if (px < 0 || px >= gridSize || py < 0 || py >= numRows) {
          fits = false;
          break;
        }
        const pad = pads[py]?.[px];
        if (!pad?.midi) { fits = false; break; }
        positions.push({ x: px, y: py, midi: pad.midi });
      }
      if (!fits) continue;

      // Score: prefer centered positions, lower on grid (reachable)
      // Center x around 2-4, center y around 1-3
      const avgX = positions.reduce((s, p) => s + p.x, 0) / positions.length;
      const avgY = positions.reduce((s, p) => s + p.y, 0) / positions.length;
      const centerX = gridSize / 2 - 1;
      const centerY = numRows / 2 - 1;
      const score = -Math.abs(avgX - centerX) - Math.abs(avgY - centerY) * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestPositions = positions;
      }
    }
  }

  return bestPositions;
}

/**
 * Find all pads on the grid that share the same pitch classes as the chord,
 * excluding the primary fingering positions.
 */
function findGhostPositions(
  chordPitchClasses: Set<number>,
  primaryKeys: Set<string>,
  pads: PadInfo[][],
  numRows: number,
  gridSize: number,
): { x: number; y: number }[] {
  const ghosts: { x: number; y: number }[] = [];
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`;
      if (primaryKeys.has(key)) continue;
      const pad = pads[y]?.[x];
      if (pad?.midi != null && chordPitchClasses.has(pad.midi % 12)) {
        ghosts.push({ x, y });
      }
    }
  }
  return ghosts;
}

export function SongsScreen() {
  const [selected, setSelected] = useState<Progression | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentChordIdx, setCurrentChordIdx] = useState(-1);
  const [padOverrides, setPadOverrides] = useState<Map<string, PadState>>(new Map());
  const audioNoteOn = useAudioStore(s => s.noteOn);
  const audioNoteOff = useAudioStore(s => s.noteOff);
  const audioAllOff = useAudioStore(s => s.allNotesOff);
  const gridNoteOn = useGridStore(s => s.noteOn);
  const gridNoteOff = useGridStore(s => s.noteOff);
  const gridAllOff = useGridStore(s => s.allNotesOff);
  const pads = useGridStore(s => s.pads);
  const config = useGridStore(s => s.config);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const playingRef = useRef(false);

  const numRows = config.visibleRows ?? config.gridSize;

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    setCurrentChordIdx(-1);
    setPadOverrides(new Map());
    audioAllOff();
    gridAllOff();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [audioAllOff, gridAllOff]);

  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playChord = useCallback((chord: ProgressionChord) => {
    audioAllOff();
    gridAllOff();

    // Find optimal fingering
    const primary = findOptimalFingering(chord, pads, config.gridSize, numRows);
    const overrides = new Map<string, PadState>();

    if (primary.length > 0) {
      // Play audio for the primary notes
      for (const pos of primary) {
        audioNoteOn(pos.midi, 0.65);
        gridNoteOn(pos.midi);
      }

      // Mark primary positions as target (yellow)
      const primaryKeys = new Set<string>();
      for (const pos of primary) {
        const key = `${pos.x},${pos.y}`;
        overrides.set(key, 'target');
        primaryKeys.add(key);
      }

      // Find and mark ghost positions (same pitch classes, different pads)
      const pitchClasses = new Set(chord.intervals.map(i => (chord.rootPitchClass + i) % 12));
      const ghosts = findGhostPositions(pitchClasses, primaryKeys, pads, numRows, config.gridSize);
      for (const pos of ghosts) {
        overrides.set(`${pos.x},${pos.y}`, 'targetGhost');
      }
    }

    setPadOverrides(overrides);
  }, [audioNoteOn, audioAllOff, gridNoteOn, gridAllOff, pads, config.gridSize, numRows]);

  const releaseChord = useCallback((chord: ProgressionChord) => {
    // Release all notes with these pitch classes
    const pitchClasses = new Set(chord.intervals.map(i => (chord.rootPitchClass + i) % 12));
    for (const row of pads) {
      for (const pad of row) {
        if (pad.midi != null && pitchClasses.has(pad.midi % 12)) {
          audioNoteOff(pad.midi);
          gridNoteOff(pad.midi);
        }
      }
    }
  }, [audioNoteOff, gridNoteOff, pads]);

  const startPlayback = useCallback((prog: Progression) => {
    stopPlayback();
    playingRef.current = true;
    setPlaying(true);

    const beatMs = 60000 / prog.tempo;
    let chordIndex = 0;

    function playNext() {
      if (!playingRef.current) return;
      const chord = prog.chords[chordIndex % prog.chords.length];
      if (!chord) return;

      setCurrentChordIdx(chordIndex % prog.chords.length);
      playChord(chord);

      timerRef.current = setTimeout(() => {
        releaseChord(chord);
        chordIndex++;
        if (chordIndex < prog.chords.length * 2 && playingRef.current) {
          timerRef.current = setTimeout(playNext, beatMs * 0.5);
        } else {
          stopPlayback();
        }
      }, beatMs * chord.beats * 0.9);
    }

    playNext();
  }, [playChord, releaseChord, stopPlayback]);

  // Song list view
  if (!selected) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Song Progressions</h2>
        <p className={styles.subheading}>
          Iconic chord progressions on the grid. Tap to explore, play to hear them loop.
        </p>
        <div className={styles.list}>
          {PROGRESSIONS.map(prog => (
            <button
              key={prog.id}
              className={styles.card}
              onClick={() => setSelected(prog)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{prog.title}</span>
                <span className={styles.cardArtist}>{prog.artist}</span>
              </div>
              <span className={styles.cardChords}>
                {prog.chords.map(c => c.name).join(' → ')}
              </span>
              <span className={styles.cardDesc}>{prog.description}</span>
              <span className={styles.cardTempo}>{prog.tempo} BPM</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Detail view: sidebar (header + chord chips) | grid
  return (
    <div className={styles.detail}>
      <div className={styles.sidebar}>
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={() => { stopPlayback(); setSelected(null); }}>
            ← Back
          </button>
          <div className={styles.detailTitle}>
            <span className={styles.songName}>{selected.title}</span>
            <span className={styles.songArtist}>{selected.artist} · {selected.tempo} BPM</span>
          </div>
          <button
            className={`${styles.playBtn} ${playing ? styles.playing : ''}`}
            onClick={() => playing ? stopPlayback() : startPlayback(selected)}
          >
            {playing ? '■ Stop' : '▶ Play'}
          </button>
        </div>

        <div className={styles.chordBar}>
          {selected.chords.map((chord, i) => (
            <button
              key={i}
              className={`${styles.chordChip} ${i === currentChordIdx ? styles.chordActive : ''}`}
              onClick={() => {
                stopPlayback();
                setCurrentChordIdx(i);
                playChord(chord);
                setTimeout(() => {
                  releaseChord(chord);
                  setPadOverrides(new Map());
                  setCurrentChordIdx(-1);
                }, 1500);
              }}
            >
              <span className={styles.chordName}>{chord.name}</span>
              <span className={styles.chordRoot}>{noteName(chord.rootPitchClass)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.gridArea}>
        <Grid padStateOverrides={padOverrides} />
      </div>
    </div>
  );
}
