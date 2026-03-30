import { useCallback, useRef } from 'react';
import { useGridStore } from '@/stores/grid-store';
import { useAudioStore } from '@/stores/audio-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Pad, type PadState } from './Pad';
import type { PadInfo } from '@/lib/music-theory';
import type { GridOffset } from '@/content/lessons/chord-lessons';
import styles from './Grid.module.css';

interface GridProps {
  /** Target pads to highlight for lessons (grid offsets from targetRoot). */
  targetShape?: readonly GridOffset[];
  /** Root position for targets (grid x,y). */
  targetRootX?: number;
  targetRootY?: number;
  /** Override pad state for specific MIDI notes. */
  padStateOverrides?: Map<number, PadState>;
  /** Callback when a note is played. */
  onNotePlay?: (midi: number) => void;
}

export function Grid({ targetShape, targetRootX = 0, targetRootY = 0, padStateOverrides, onNotePlay }: GridProps) {
  const pads = useGridStore(s => s.pads);
  const activeNotes = useGridStore(s => s.activeNotes);
  const config = useGridStore(s => s.config);
  const gridNoteOn = useGridStore(s => s.noteOn);
  const gridNoteOff = useGridStore(s => s.noteOff);
  const audioNoteOn = useAudioStore(s => s.noteOn);
  const audioNoteOff = useAudioStore(s => s.noteOff);
  const showNoteNames = useSettingsStore(s => s.showNoteNames);
  const hapticFeedback = useSettingsStore(s => s.hapticFeedback);

  const activeTouchNotes = useRef(new Map<number, number>());

  // Precompute target positions as a set of "x,y" strings for O(1) lookup
  const targetSet = useRef(new Set<string>());
  const targetLabels = useRef(new Map<string, string>());
  targetSet.current.clear();
  targetLabels.current.clear();
  if (targetShape) {
    for (const offset of targetShape) {
      const key = `${targetRootX + offset.dx},${targetRootY + offset.dy}`;
      targetSet.current.add(key);
      if (offset.label) targetLabels.current.set(key, offset.label);
    }
  }

  const handleNoteOn = useCallback((midi: number) => {
    gridNoteOn(midi);
    audioNoteOn(midi);
    onNotePlay?.(midi);
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [gridNoteOn, audioNoteOn, onNotePlay, hapticFeedback]);

  const handleNoteOff = useCallback((midi: number) => {
    gridNoteOff(midi);
    audioNoteOff(midi);
  }, [gridNoteOff, audioNoteOff]);

  const handlePointerEnter = useCallback((midi: number, pressing: boolean) => {
    if (pressing) {
      handleNoteOn(midi);
    }
  }, [handleNoteOn]);

  const getPadState = (pad: PadInfo, x: number, y: number): PadState => {
    if (pad.midi !== null && padStateOverrides?.has(pad.midi)) {
      return padStateOverrides.get(pad.midi)!;
    }
    const key = `${x},${y}`;
    if (targetSet.current.has(key)) return 'target';
    if (pad.isRoot) return 'root';
    if (pad.inScale) return 'inScale';
    return 'outOfScale';
  };

  // Render grid rows top-down (row 7 at top, row 0 at bottom) to match Push layout
  const rows = [];
  for (let y = config.gridSize - 1; y >= 0; y--) {
    const row = pads[y];
    if (!row) continue;
    for (let x = 0; x < config.gridSize; x++) {
      const pad = row[x];
      if (!pad) continue;
      const key = `${x},${y}`;
      rows.push(
        <Pad
          key={key}
          midi={pad.midi}
          padState={getPadState(pad, x, y)}
          isPressed={pad.midi !== null && activeNotes.has(pad.midi)}
          showNoteNames={showNoteNames}
          intervalLabel={targetLabels.current.get(key)}
          onPointerDown={handleNoteOn}
          onPointerUp={handleNoteOff}
          onPointerEnter={handlePointerEnter}
        />,
      );
    }
  }

  return (
    <>
      <div className={styles.rotateHint} role="alert">
        <span className={styles.rotateIcon} aria-hidden="true">↻</span>
        <span>Rotate your device to landscape for the best experience</span>
      </div>
      <div className={styles.gridWrapper} onContextMenu={e => e.preventDefault()}>
        <div className={styles.grid} role="grid" aria-label="Note grid">
          {rows}
        </div>
      </div>
    </>
  );
}
