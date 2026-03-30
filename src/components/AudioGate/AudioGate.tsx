import { useAudioStore } from '@/stores/audio-store';
import { useSettingsStore } from '@/stores/settings-store';
import styles from './AudioGate.module.css';

export function AudioGate({ children }: { children: React.ReactNode }) {
  const audioUnlocked = useSettingsStore(s => s.audioUnlocked);
  const setAudioUnlocked = useSettingsStore(s => s.setAudioUnlocked);
  const initAudio = useAudioStore(s => s.initAudio);

  const handleUnlock = async () => {
    await initAudio();
    setAudioUnlocked(true);
  };

  if (!audioUnlocked) {
    return (
      <div className={styles.gate}>
        <div className={styles.content}>
          <h1 className={styles.title}>Push Tutor</h1>
          <p className={styles.subtitle}>Learn the grid. Play by shapes.</p>
          <button className={styles.unlockBtn} onClick={handleUnlock}>
            <span className={styles.icon} aria-hidden="true">♪</span>
            Tap to Start
          </button>
          <p className={styles.hint}>Audio requires a user gesture to activate on mobile browsers</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
