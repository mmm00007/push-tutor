import { create } from 'zustand';
import { createAudioEngine, type AudioEngine } from '@/audio/engine';
import { loadSettings, saveSettings } from '@/lib/storage';

interface AudioState {
  engine: AudioEngine;
  initialized: boolean;
  presetName: string;
  volume: number;

  // Actions
  initAudio: () => Promise<void>;
  setPreset: (name: string) => void;
  setVolume: (vol: number) => void;
  noteOn: (midi: number, velocity?: number) => void;
  noteOff: (midi: number) => void;
  allNotesOff: () => void;
  metronomeClick: (accent?: boolean) => void;
}

export const useAudioStore = create<AudioState>()((set, get) => {
  const engine = createAudioEngine();
  const settings = loadSettings();

  return {
    engine,
    initialized: false,
    presetName: settings.lastPreset,
    volume: 0.8,

    initAudio: async () => {
      const { engine, initialized, presetName } = get();
      if (initialized) {
        await engine.resume();
        return;
      }
      await engine.init();
      engine.setPreset(presetName);
      set({ initialized: true });
    },

    setPreset: (name) => {
      get().engine.setPreset(name);
      saveSettings({ lastPreset: name });
      set({ presetName: name });
    },

    setVolume: (vol) => {
      get().engine.setVolume(vol);
      set({ volume: vol });
    },

    noteOn: (midi, velocity = 0.8) => {
      get().engine.noteOn(midi, velocity);
    },

    noteOff: (midi) => {
      get().engine.noteOff(midi);
    },

    allNotesOff: () => {
      get().engine.allNotesOff();
    },

    metronomeClick: (accent) => {
      get().engine.metronomeClick(accent);
    },
  };
});
