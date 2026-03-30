import { memo } from 'react';
import { noteLabel as formatNoteLabel } from '@/lib/music-theory/notes';
import styles from './Pad.module.css';

export type PadState = 'outOfScale' | 'inScale' | 'root' | 'octaveMarker' | 'target' | 'targetGhost' | 'targetCorrect' | 'targetIncorrect';

interface PadProps {
  midi: number | null;
  padState: PadState;
  isPressed: boolean;
  showNoteNames: boolean;
  intervalLabel?: string;
  onPointerDown: (midi: number, pointerId?: number) => void;
  onPointerUp: (midi: number, pointerId?: number) => void;
  onPointerEnter: (midi: number, pressing: boolean, pointerId?: number) => void;
}

export const Pad = memo(function Pad({
  midi,
  padState,
  isPressed,
  showNoteNames,
  intervalLabel,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
}: PadProps) {
  const classNames = [
    styles.pad,
    styles[padState],
    isPressed && styles.pressed,
  ].filter(Boolean).join(' ');

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (midi !== null) onPointerDown(midi, e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (midi !== null) onPointerUp(midi, e.pointerId);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (midi !== null) onPointerEnter(midi, e.pressure > 0 || e.buttons > 0, e.pointerId);
  };

  return (
    <div
      className={classNames}
      role="button"
      tabIndex={0}
      aria-label={midi !== null ? formatNoteLabel(midi) : 'empty pad'}
      aria-pressed={isPressed}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (midi !== null) onPointerDown(midi);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          if (midi !== null) onPointerUp(midi);
        }
      }}
    >
      {showNoteNames && midi !== null && (
        <span className={styles.noteLabel}>{formatNoteLabel(midi)}</span>
      )}
      {intervalLabel && (
        <span className={styles.intervalLabel}>{intervalLabel}</span>
      )}
    </div>
  );
});
