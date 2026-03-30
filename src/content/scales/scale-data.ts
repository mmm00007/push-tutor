import { NOTE_NAMES } from '@/lib/music-theory/notes';
import { SCALES, SCALE_KEYS } from '@/lib/music-theory/scales';

export interface ScaleOption {
  key: string;
  name: string;
}

export interface RootOption {
  pitchClass: number;
  name: string;
}

export const SCALE_OPTIONS: ScaleOption[] = SCALE_KEYS.map(key => ({
  key,
  name: SCALES[key]!.name,
}));

export const ROOT_OPTIONS: RootOption[] = NOTE_NAMES.map((name, i) => ({
  pitchClass: i,
  name,
}));
