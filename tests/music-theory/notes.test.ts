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

  describe('octaveOf', () => {
    it('C4 = midi 60 → octave 4', () => {
      expect(octaveOf(60)).toBe(4);
    });
    it('C1 = midi 36 → octave 1', () => {
      expect(octaveOf(36)).toBe(2);
    });
    it('A0 = midi 21 → octave 0', () => {
      expect(octaveOf(21)).toBe(0);
    });
  });

  describe('noteName', () => {
    it('midi 60 = C', () => expect(noteName(60)).toBe('C'));
    it('midi 61 = C#', () => expect(noteName(61)).toBe('C#'));
    it('midi 69 = A', () => expect(noteName(69)).toBe('A'));
  });

  describe('noteLabel', () => {
    it('midi 60 = C4', () => expect(noteLabel(60)).toBe('C4'));
    it('midi 69 = A4', () => expect(noteLabel(69)).toBe('A4'));
  });

  describe('midiFromNote', () => {
    it('C4 = 60', () => expect(midiFromNote('C', 4)).toBe(60));
    it('A4 = 69', () => expect(midiFromNote('A', 4)).toBe(69));
    it('C-1 = 0', () => expect(midiFromNote('C', -1)).toBe(0));
  });

  describe('parseMidiNote', () => {
    it('parses C4 to 60', () => expect(parseMidiNote('C4')).toBe(60));
    it('parses A4 to 69', () => expect(parseMidiNote('A4')).toBe(69));
    it('parses F#2 to 42', () => expect(parseMidiNote('F#2')).toBe(42));
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
