import { useSettingsStore } from '@/stores/settings-store';
import { useAudioStore } from '@/stores/audio-store';
import styles from './Settings.module.css';

export function Settings() {
  const settings = useSettingsStore();
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const volume = useAudioStore(s => s.volume);
  const setVolume = useAudioStore(s => s.setVolume);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Settings</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Display</h3>

        <label className={styles.toggle}>
          <span>Show note names on pads</span>
          <input
            type="checkbox"
            checked={settings.showNoteNames}
            onChange={e => updateSettings({ showNoteNames: e.target.checked })}
          />
          <span className={styles.switch} />
        </label>

        <label className={styles.toggle}>
          <span>Reduce motion</span>
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={e => updateSettings({ reduceMotion: e.target.checked })}
          />
          <span className={styles.switch} />
        </label>

        <label className={styles.toggle}>
          <span>Haptic feedback</span>
          <input
            type="checkbox"
            checked={settings.hapticFeedback}
            onChange={e => updateSettings({ hapticFeedback: e.target.checked })}
          />
          <span className={styles.switch} />
        </label>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Audio</h3>

        <div className={styles.slider}>
          <label htmlFor="volume-slider">Volume</label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
          />
          <span className={styles.sliderValue}>{Math.round(volume * 100)}%</span>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Data</h3>

        <button
          className={styles.dangerBtn}
          onClick={() => {
            if (confirm('Reset all lesson progress? This cannot be undone.')) {
              indexedDB.deleteDatabase('push-tutor');
              window.location.reload();
            }
          }}
        >
          Reset Progress
        </button>

        <button
          className={styles.dangerBtn}
          onClick={() => {
            if (confirm('Reset all settings to defaults?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          Reset Settings
        </button>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>About</h3>
        <p className={styles.about}>
          Push Tutor teaches Push-style 8x8 grid playing with movable chord shapes
          in chromatic 4ths mode. Built for beginners with zero piano background.
        </p>
        <p className={styles.version}>v0.1.0</p>
      </section>
    </div>
  );
}
