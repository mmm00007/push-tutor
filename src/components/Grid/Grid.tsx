import { useCallback, useMemo, useRef, useState } from 'react';
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
  /** Override pad state by position key "x,y". */
  padStateOverrides?: Map<string, PadState>;
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

  // Track pointerId -> currently sounding MIDI for slide-across-pads
  const pointerNotes = useRef(new Map<number, number>());

  // Precompute target positions with useMemo to keep Pad memoization effective
  const { targetSet, targetLabels } = useMemo(() => {
    const ts = new Set<string>();
    const tl = new Map<string, string>();
    if (targetShape) {
      for (const offset of targetShape) {
        const key = `${targetRootX + offset.dx},${targetRootY + offset.dy}`;
        ts.add(key);
        if (offset.label) tl.set(key, offset.label);
      }
    }
    return { targetSet: ts, targetLabels: tl };
  }, [targetShape, targetRootX, targetRootY]);

  const handleNoteOn = useCallback((midi: number, pointerId?: number) => {
    // Release previous note for this pointer (slide-across-pads)
    if (pointerId !== undefined) {
      const prev = pointerNotes.current.get(pointerId);
      if (prev !== undefined && prev !== midi) {
        gridNoteOff(prev);
        audioNoteOff(prev);
      }
      pointerNotes.current.set(pointerId, midi);
    }
    gridNoteOn(midi);
    audioNoteOn(midi);
    onNotePlay?.(midi);
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [gridNoteOn, gridNoteOff, audioNoteOn, audioNoteOff, onNotePlay, hapticFeedback]);

  const handleNoteOff = useCallback((midi: number, pointerId?: number) => {
    if (pointerId !== undefined) {
      pointerNotes.current.delete(pointerId);
    }
    gridNoteOff(midi);
    audioNoteOff(midi);
  }, [gridNoteOff, audioNoteOff]);

  const handlePointerEnter = useCallback((midi: number, pressing: boolean, pointerId?: number) => {
    if (pressing) {
      handleNoteOn(midi, pointerId);
    }
  }, [handleNoteOn]);

  const scaleMode = config.scaleMode;

  const getPadState = useCallback((pad: PadInfo, x: number, y: number): PadState => {
    const key = `${x},${y}`;
    if (padStateOverrides?.has(key)) {
      return padStateOverrides.get(key)!;
    }
    if (targetSet.has(key)) return 'target';
    if (pad.isRoot) return 'root';
    if (pad.midi !== null && scaleMode === 'chromatic' && ((pad.midi % 12) === 0)) return 'octaveMarker';
    if (pad.inScale) return 'inScale';
    return 'outOfScale';
  }, [padStateOverrides, targetSet, scaleMode]);

  // Render grid rows top-down (topmost row at top, row 0 at bottom) to match Push layout
  const numRows = config.visibleRows ?? config.gridSize;
  const rows = [];
  for (let y = numRows - 1; y >= 0; y--) {
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
          intervalLabel={targetLabels.get(key)}
          onPointerDown={handleNoteOn}
          onPointerUp={handleNoteOff}
          onPointerEnter={handlePointerEnter}
        />,
      );
    }
  }

  const [hintDismissed, setHintDismissed] = useState(false);

  return (
    <>
      {!hintDismissed && (
        <div className={styles.rotateHint}>
          <span className={styles.rotateIcon} aria-hidden="true">↻</span>
          <span>Landscape mode gives you bigger pads</span>
          <button className={styles.dismissBtn} onClick={() => setHintDismissed(true)}>OK</button>
        </div>
      )}
      <div className={styles.gridWrapper} onContextMenu={e => e.preventDefault()}>
        <div
          className={styles.grid}
          role="grid"
          aria-label="Note grid"
          style={{
            gridTemplateRows: `repeat(${numRows}, 1fr)`,
            aspectRatio: `${config.gridSize} / ${numRows}`,
          }}
        >
          {rows}
        </div>
      </div>
    </>
  );
}
