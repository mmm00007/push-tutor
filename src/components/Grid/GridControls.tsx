import { useGridStore } from '@/stores/grid-store';
import { useAudioStore } from '@/stores/audio-store';
import { SCALE_OPTIONS, ROOT_OPTIONS } from '@/content/scales/scale-data';
import { PRESET_KEYS, PRESETS } from '@/audio/presets';
import { SCALES } from '@/lib/music-theory/scales';
import styles from './GridControls.module.css';

export function GridControls() {
  const config = useGridStore(s => s.config);
  const setRoot = useGridStore(s => s.setRoot);
  const setScale = useGridStore(s => s.setScale);
  const setLayout = useGridStore(s => s.setLayout);
  const setScaleMode = useGridStore(s => s.setScaleMode);
  const setOctaveShift = useGridStore(s => s.setOctaveShift);
  const presetName = useAudioStore(s => s.presetName);
  const setPreset = useAudioStore(s => s.setPreset);

  const currentScaleKey = Object.entries(SCALES).find(
    ([, v]) => v.name === config.scale.name
  )?.[0] ?? 'major';

  return (
    <div className={styles.controls}>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="root-select">Root</label>
        <select
          id="root-select"
          className={styles.select}
          value={config.rootPitchClass}
          onChange={e => setRoot(Number(e.target.value))}
        >
          {ROOT_OPTIONS.map(r => (
            <option key={r.pitchClass} value={r.pitchClass}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="scale-select">Scale</label>
        <select
          id="scale-select"
          className={styles.select}
          value={currentScaleKey}
          onChange={e => setScale(e.target.value)}
        >
          {SCALE_OPTIONS.map(s => (
            <option key={s.key} value={s.key}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Layout</label>
        <div className={styles.buttonGroup} role="radiogroup" aria-label="Layout mode">
          {(['fourths', 'thirds', 'sequential'] as const).map(l => (
            <button
              key={l}
              className={`${styles.toggleBtn} ${config.layout === l ? styles.active : ''}`}
              onClick={() => setLayout(l)}
              role="radio"
              aria-checked={config.layout === l}
            >
              {l === 'fourths' ? '4ths' : l === 'thirds' ? '3rds' : 'Seq'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Mode</label>
        <div className={styles.buttonGroup} role="radiogroup" aria-label="Scale mode">
          <button
            className={`${styles.toggleBtn} ${config.scaleMode === 'chromatic' ? styles.active : ''}`}
            onClick={() => setScaleMode('chromatic')}
            role="radio"
            aria-checked={config.scaleMode === 'chromatic'}
          >
            Chromatic
          </button>
          <button
            className={`${styles.toggleBtn} ${config.scaleMode === 'inKey' ? styles.active : ''}`}
            onClick={() => setScaleMode('inKey')}
            role="radio"
            aria-checked={config.scaleMode === 'inKey'}
          >
            In Key
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Octave</label>
        <div className={styles.buttonGroup}>
          <button
            className={styles.toggleBtn}
            onClick={() => setOctaveShift(config.octaveShift - 1)}
            disabled={config.octaveShift <= -3}
            aria-label="Octave down"
          >
            −
          </button>
          <span className={styles.octaveValue}>{config.octaveShift >= 0 ? '+' : ''}{config.octaveShift}</span>
          <button
            className={styles.toggleBtn}
            onClick={() => setOctaveShift(config.octaveShift + 1)}
            disabled={config.octaveShift >= 3}
            aria-label="Octave up"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="preset-select">Sound</label>
        <select
          id="preset-select"
          className={styles.select}
          value={presetName}
          onChange={e => setPreset(e.target.value)}
        >
          {PRESET_KEYS.map(k => (
            <option key={k} value={k}>{PRESETS[k]!.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
