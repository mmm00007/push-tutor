import { useGridStore } from '@/stores/grid-store';
import { useAudioStore } from '@/stores/audio-store';
import { SCALE_OPTIONS, ROOT_OPTIONS } from '@/content/scales/scale-data';
import { PRESET_KEYS, PRESETS } from '@/audio/presets';
import { SCALES } from '@/lib/music-theory/scales';
import type { VisibleRows } from '@/lib/music-theory';
import styles from './ControlsScreen.module.css';

const ROW_OPTIONS: { value: VisibleRows; label: string }[] = [
  { value: 4, label: '4 rows' },
  { value: 5, label: '5 rows' },
  { value: 6, label: '6 rows' },
  { value: 8, label: '8 rows' },
];

export function ControlsScreen() {
  const config = useGridStore(s => s.config);
  const setRoot = useGridStore(s => s.setRoot);
  const setScale = useGridStore(s => s.setScale);
  const setLayout = useGridStore(s => s.setLayout);
  const setScaleMode = useGridStore(s => s.setScaleMode);
  const setOctaveShift = useGridStore(s => s.setOctaveShift);
  const setVisibleRows = useGridStore(s => s.setVisibleRows);
  const presetName = useAudioStore(s => s.presetName);
  const setPreset = useAudioStore(s => s.setPreset);
  const volume = useAudioStore(s => s.volume);
  const setVolume = useAudioStore(s => s.setVolume);

  const currentScaleKey = Object.entries(SCALES).find(
    ([, v]) => v.name === config.scale.name,
  )?.[0] ?? 'major';

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Grid Controls</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Note Layout</h3>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="ctrl-root">Root Note</label>
          <select
            id="ctrl-root"
            className={styles.select}
            value={config.rootPitchClass}
            onChange={e => setRoot(Number(e.target.value))}
          >
            {ROOT_OPTIONS.map(r => (
              <option key={r.pitchClass} value={r.pitchClass}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="ctrl-scale">Scale</label>
          <select
            id="ctrl-scale"
            className={styles.select}
            value={currentScaleKey}
            onChange={e => setScale(e.target.value)}
          >
            {SCALE_OPTIONS.map(s => (
              <option key={s.key} value={s.key}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Layout</span>
          <div className={styles.btnGroup} role="radiogroup" aria-label="Layout mode">
            {(['fourths', 'thirds', 'sequential'] as const).map(l => (
              <button
                key={l}
                className={`${styles.btn} ${config.layout === l ? styles.active : ''}`}
                onClick={() => setLayout(l)}
                role="radio"
                aria-checked={config.layout === l}
              >
                {l === 'fourths' ? '4ths' : l === 'thirds' ? '3rds' : 'Sequential'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Mode</span>
          <div className={styles.btnGroup} role="radiogroup" aria-label="Scale mode">
            <button
              className={`${styles.btn} ${config.scaleMode === 'chromatic' ? styles.active : ''}`}
              onClick={() => setScaleMode('chromatic')}
              role="radio"
              aria-checked={config.scaleMode === 'chromatic'}
            >
              Chromatic
            </button>
            <button
              className={`${styles.btn} ${config.scaleMode === 'inKey' ? styles.active : ''}`}
              onClick={() => setScaleMode('inKey')}
              role="radio"
              aria-checked={config.scaleMode === 'inKey'}
            >
              In Key
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Grid Size</h3>

        <div className={styles.row}>
          <span className={styles.label}>Octave</span>
          <div className={styles.btnGroup}>
            <button
              className={styles.btn}
              onClick={() => setOctaveShift(config.octaveShift - 1)}
              disabled={config.octaveShift <= -3}
              aria-label="Octave down"
            >
              −
            </button>
            <span className={styles.value}>{config.octaveShift >= 0 ? '+' : ''}{config.octaveShift}</span>
            <button
              className={styles.btn}
              onClick={() => setOctaveShift(config.octaveShift + 1)}
              disabled={config.octaveShift >= 3}
              aria-label="Octave up"
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Rows</span>
          <div className={styles.btnGroup} role="radiogroup" aria-label="Visible rows">
            {ROW_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`${styles.btn} ${config.visibleRows === opt.value ? styles.active : ''}`}
                onClick={() => setVisibleRows(opt.value)}
                role="radio"
                aria-checked={config.visibleRows === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Sound</h3>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="ctrl-preset">Preset</label>
          <select
            id="ctrl-preset"
            className={styles.select}
            value={presetName}
            onChange={e => setPreset(e.target.value)}
          >
            {PRESET_KEYS.map(k => (
              <option key={k} value={k}>{PRESETS[k]!.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="ctrl-volume">Volume</label>
          <input
            id="ctrl-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.value}>{Math.round(volume * 100)}%</span>
        </div>
      </section>
    </div>
  );
}
