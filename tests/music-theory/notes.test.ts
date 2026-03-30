import { describe, it, expect } from 'vitest';
import {
  pitchClass, octaveOf, noteName, noteLabel, midiFromNote,
  parseMidiNote, midiToFrequency, transpose, clampMidi,
} from '@/lib/music-theory/notes';

describe('notes', () => {
  describe('pitchClass', () => {
    it('returns 0 for C (midi 60)', () => {
      expect(pitchClass(60)).toBe(0);
    });
    it('returns 0 for C1 (midi 36)', () => {
      expect(pitchClass(36)).toBe(0);
    });
    it('returns 4 for E (midi 64)', () => {
      expect(pitchClass(64)).toBe(4);
    });
    it('wraps correctly for all octaves', () => {
      for (let oct = 0; oct <= 8; oct++) {
        expect(pitchClass(oct * 12)).toBe(0); // All C notes
      }
    });
  });

  describe('octaveOf (Ableton convention: C3 = MIDI 60)', () => {
    it('C3 = midi 60 → octave 3', () => {
      expect(octaveOf(60)).toBe(3);
    });
    it('C1 = midi 36 → octave 1', () => {
      expect(octaveOf(36)).toBe(1);
    });
    it('A-1 = midi 21 → octave -1', () => {
      expect(octaveOf(21)).toBe(-1);
    });
    it('C-2 = midi 0 → octave -2', () => {
      expect(octaveOf(0)).toBe(-2);
    });
  });

  describe('noteName', () => {
    it('midi 60 = C', () => expect(noteName(60)).toBe('C'));
    it('midi 61 = C#', () => expect(noteName(61)).toBe('C#'));
    it('midi 69 = A', () => expect(noteName(69)).toBe('A'));
  });

  describe('noteLabel (Ableton convention)', () => {
    it('midi 60 = C3', () => expect(noteLabel(60)).toBe('C3'));
    it('midi 69 = A3', () => expect(noteLabel(69)).toBe('A3'));
    it('midi 36 = C1', () => expect(noteLabel(36)).toBe('C1'));
  });

  describe('midiFromNote (Ableton convention)', () => {
    it('C3 = 60', () => expect(midiFromNote('C', 3)).toBe(60));
    it('A3 = 69', () => expect(midiFromNote('A', 3)).toBe(69));
    it('C-2 = 0', () => expect(midiFromNote('C', -2)).toBe(0));
    it('C1 = 36', () => expect(midiFromNote('C', 1)).toBe(36));
  });

  describe('parseMidiNote (Ableton convention)', () => {
    it('parses C3 to 60', () => expect(parseMidiNote('C3')).toBe(60));
    it('parses A3 to 69', () => expect(parseMidiNote('A3')).toBe(69));
    it('parses F#1 to 42', () => expect(parseMidiNote('F#1')).toBe(42));
    it('returns null for invalid', () => expect(parseMidiNote('X9')).toBeNull());
  });

  describe('midiToFrequency', () => {
    it('A4 (69) = 440 Hz', () => {
      expect(midiToFrequency(69)).toBeCloseTo(440, 1);
    });
    it('A3 (57) = 220 Hz', () => {
      expect(midiToFrequency(57)).toBeCloseTo(220, 1);
    });
  });

  describe('transpose', () => {
    it('transposes up', () => expect(transpose(60, 7)).toBe(67));
    it('transposes down', () => expect(transpose(60, -12)).toBe(48));
    it('clamps to 0', () => expect(transpose(5, -10)).toBe(0));
    it('clamps to 127', () => expect(transpose(120, 20)).toBe(127));
  });

  describe('clampMidi', () => {
    it('clamps negative to 0', () => expect(clampMidi(-5)).toBe(0));
    it('clamps over 127', () => expect(clampMidi(200)).toBe(127));
    it('passes through valid', () => expect(clampMidi(64)).toBe(64));
  });
});
