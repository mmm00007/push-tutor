/** Type-safe localStorage wrapper for small settings. */

const PREFIX = 'push-tutor:';

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/** Settings stored in localStorage. */
export interface AppSettings {
  theme: 'dark' | 'light';
  lastPreset: string;
  lastRoot: number;
  lastScale: string;
  lastLayout: string;
  lastScaleMode: string;
  onboardingComplete: boolean;
  reduceMotion: boolean;
  showNoteNames: boolean;
  hapticFeedback: boolean;
  octaveShift: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  lastPreset: 'piano',
  lastRoot: 0,
  lastScale: 'major',
  lastLayout: 'fourths',
  lastScaleMode: 'chromatic',
  onboardingComplete: false,
  reduceMotion: false,
  showNoteNames: true,
  hapticFeedback: true,
  octaveShift: 0,
};

export function loadSettings(): AppSettings {
  return {
    theme: getItem('theme', DEFAULT_SETTINGS.theme),
    lastPreset: getItem('lastPreset', DEFAULT_SETTINGS.lastPreset),
    lastRoot: getItem('lastRoot', DEFAULT_SETTINGS.lastRoot),
    lastScale: getItem('lastScale', DEFAULT_SETTINGS.lastScale),
    lastLayout: getItem('lastLayout', DEFAULT_SETTINGS.lastLayout),
    lastScaleMode: getItem('lastScaleMode', DEFAULT_SETTINGS.lastScaleMode),
    onboardingComplete: getItem('onboardingComplete', DEFAULT_SETTINGS.onboardingComplete),
    reduceMotion: getItem('reduceMotion', DEFAULT_SETTINGS.reduceMotion),
    showNoteNames: getItem('showNoteNames', DEFAULT_SETTINGS.showNoteNames),
    hapticFeedback: getItem('hapticFeedback', DEFAULT_SETTINGS.hapticFeedback),
    octaveShift: getItem('octaveShift', DEFAULT_SETTINGS.octaveShift),
  };
}

export function saveSettings(settings: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(settings)) {
    setItem(key, value);
  }
}
