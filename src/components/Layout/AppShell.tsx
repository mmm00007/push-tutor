import { useSettingsStore, type Screen } from '@/stores/settings-store';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'practice', label: 'Play', icon: '▶' },
  { screen: 'controls', label: 'Controls', icon: '♫' },
  { screen: 'lessons', label: 'Lessons', icon: '📖' },
  { screen: 'quiz', label: 'Quiz', icon: '✓' },
  { screen: 'settings', label: 'Settings', icon: '⚙' },
];

export function AppShell({ children }: AppShellProps) {
  const currentScreen = useSettingsStore(s => s.currentScreen);
  const setScreen = useSettingsStore(s => s.setScreen);

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        {children}
      </main>
      <nav className={styles.nav} aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.screen}
            className={`${styles.navBtn} ${currentScreen === item.screen ? styles.navActive : ''}`}
            onClick={() => setScreen(item.screen)}
            aria-current={currentScreen === item.screen ? 'page' : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
