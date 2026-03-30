import { create } from 'zustand';
import {
  type LayoutMode, type ScaleMode, type GridConfig, type PadInfo, type VisibleRows,
  type ScaleDefinition,
  SCALES, DEFAULT_GRID_CONFIG, buildPadGrid,
} from '@/lib/music-theory';
import { loadSettings, saveSettings } from '@/lib/storage';

interface GridState {
  config: GridConfig;
  pads: PadInfo[][];
  activeNotes: Set<number>;

  setRoot: (pitchClass: number) => void;
  setScale: (scaleKey: string) => void;
  setLayout: (layout: LayoutMode) => void;
  setScaleMode: (mode: ScaleMode) => void;
  setOctaveShift: (shift: number) => void;
  setVisibleRows: (rows: VisibleRows) => void;
  noteOn: (midi: number) => void;
  noteOff: (midi: number) => void;
  allNotesOff: () => void;
}

function rebuildPads(config: GridConfig): PadInfo[][] {
  return buildPadGrid(config);
}

function initialConfig(): GridConfig {
  const settings = loadSettings();
  const scaleKey = settings.lastScale;
  const scale: ScaleDefinition = SCALES[scaleKey] ?? SCALES['major']!;

  return {
    ...DEFAULT_GRID_CONFIG,
    rootPitchClass: settings.lastRoot,
    scale,
    layout: (settings.lastLayout as LayoutMode) || 'fourths',
    scaleMode: (settings.lastScaleMode as ScaleMode) || 'chromatic',
    octaveShift: settings.octaveShift,
    visibleRows: (settings.visibleRows as VisibleRows) || 8,
  };
}

export const useGridStore = create<GridState>()((set) => {
  const config = initialConfig();
  return {
    config,
    pads: rebuildPads(config),
    activeNotes: new Set<number>(),

    setRoot: (pitchClass) =>
      set((state) => {
        const config = { ...state.config, rootPitchClass: pitchClass };
        saveSettings({ lastRoot: pitchClass });
        return { config, pads: rebuildPads(config) };
      }),

    setScale: (scaleKey) =>
      set((state) => {
        const scale = SCALES[scaleKey];
        if (!scale) return state;
        const config = { ...state.config, scale };
        saveSettings({ lastScale: scaleKey });
        return { config, pads: rebuildPads(config) };
      }),

    setLayout: (layout) =>
      set((state) => {
        const config = { ...state.config, layout };
        saveSettings({ lastLayout: layout });
        return { config, pads: rebuildPads(config) };
      }),

    setScaleMode: (scaleMode) =>
      set((state) => {
        const config = { ...state.config, scaleMode };
        saveSettings({ lastScaleMode: scaleMode });
        return { config, pads: rebuildPads(config) };
      }),

    setOctaveShift: (octaveShift) =>
      set((state) => {
        const clamped = Math.max(-3, Math.min(3, octaveShift));
        const config = { ...state.config, octaveShift: clamped };
        saveSettings({ octaveShift: clamped });
        return { config, pads: rebuildPads(config) };
      }),

    setVisibleRows: (visibleRows) =>
      set((state) => {
        const config = { ...state.config, visibleRows };
        saveSettings({ visibleRows });
        return { config, pads: rebuildPads(config) };
      }),

    noteOn: (midi) =>
      set((state) => {
        const next = new Set(state.activeNotes);
        next.add(midi);
        return { activeNotes: next };
      }),

    noteOff: (midi) =>
      set((state) => {
        const next = new Set(state.activeNotes);
        next.delete(midi);
        return { activeNotes: next };
      }),

    allNotesOff: () => set({ activeNotes: new Set() }),
  };
});
