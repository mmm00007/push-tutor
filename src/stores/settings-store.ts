import { create } from 'zustand';
import { type AppSettings, loadSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/storage';

type Screen = 'practice' | 'controls' | 'lessons' | 'quiz' | 'settings';

interface SettingsState extends AppSettings {
  currentScreen: Screen;
  audioUnlocked: boolean;

  setScreen: (screen: Screen) => void;
  setAudioUnlocked: (unlocked: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()((set) => {
  const saved = loadSettings();
  return {
    ...saved,
    currentScreen: 'practice' as Screen,
    audioUnlocked: false,

    setScreen: (currentScreen) => set({ currentScreen }),

    setAudioUnlocked: (audioUnlocked) => set({ audioUnlocked }),

    updateSettings: (patch) => {
      saveSettings(patch);
      set(patch);
    },

    completeOnboarding: () => {
      saveSettings({ onboardingComplete: true });
      set({ onboardingComplete: true });
    },
  };
});

export type { Screen };
