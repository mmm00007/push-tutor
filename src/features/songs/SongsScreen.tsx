import { useState, useCallback, useRef, useEffect } from 'react';
import { SADE_PROGRESSIONS, type Progression, type ProgressionChord } from '@/content/progressions/sade-progressions';
import { useAudioStore } from '@/stores/audio-store';
import { useGridStore } from '@/stores/grid-store';
import { Grid } from '@/components/Grid/Grid';
import { type PadState } from '@/components/Grid/Pad';
import { noteName } from '@/lib/music-theory/notes';
import styles from './SongsScreen.module.css';

function chordMidiNotes(chord: ProgressionChord, baseOctaveMidi: number): number[] {
  const rootMidi = baseOctaveMidi + chord.rootPitchClass;
  return chord.intervals.map(i => rootMidi + i);
}

export function SongsScreen() {
  const [selected, setSelected] = useState<Progression | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentChordIdx, setCurrentChordIdx] = useState(-1);
  const [padOverrides, setPadOverrides] = useState<Map<number, PadState>>(new Map());
  const audioNoteOn = useAudioStore(s => s.noteOn);
  const audioNoteOff = useAudioStore(s => s.noteOff);
  const audioAllOff = useAudioStore(s => s.allNotesOff);
  const gridNoteOn = useGridStore(s => s.noteOn);
  const gridNoteOff = useGridStore(s => s.noteOff);
  const gridAllOff = useGridStore(s => s.allNotesOff);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const playingRef = useRef(false);

  const BASE_OCTAVE_MIDI = 48; // C2

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    setCurrentChordIdx(-1);
    setPadOverrides(new Map());
    audioAllOff();
    gridAllOff();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [audioAllOff, gridAllOff]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playChord = useCallback((chord: ProgressionChord) => {
    audioAllOff();
    gridAllOff();
    const notes = chordMidiNotes(chord, BASE_OCTAVE_MIDI);
    const overrides = new Map<number, PadState>();
    for (const midi of notes) {
      audioNoteOn(midi, 0.65);
      gridNoteOn(midi);
      overrides.set(midi, 'target');
    }
    setPadOverrides(overrides);
  }, [audioNoteOn, audioAllOff, gridNoteOn, gridAllOff]);

  const releaseChord = useCallback((chord: ProgressionChord) => {
    const notes = chordMidiNotes(chord, BASE_OCTAVE_MIDI);
    for (const midi of notes) {
      audioNoteOff(midi);
      gridNoteOff(midi);
    }
  }, [audioNoteOff, gridNoteOff]);

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

      // Schedule release + next chord
      timerRef.current = setTimeout(() => {
        releaseChord(chord);
        chordIndex++;
        // Loop through the progression twice then stop
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
          {SADE_PROGRESSIONS.map(prog => (
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

  // Progression detail + grid view
  return (
    <div className={styles.detail}>
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

      <Grid padStateOverrides={padOverrides} />
    </div>
  );
}
