import { describe, expect, it } from 'vitest';
import { freqToMidi, midiToFreq, midiToName } from './oscillator';

describe('midiToFreq', () => {
  it('anchors A4 (MIDI 69) at 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 10);
  });

  it('doubles frequency per octave (+12 semitones)', () => {
    expect(midiToFreq(81)).toBeCloseTo(880, 10);
    expect(midiToFreq(57)).toBeCloseTo(220, 10);
  });

  it('matches known concert pitches', () => {
    expect(midiToFreq(60)).toBeCloseTo(261.6256, 3); // middle C
    expect(midiToFreq(0)).toBeCloseTo(8.1758, 3);
  });
});

describe('freqToMidi', () => {
  it('inverts midiToFreq at the A4 anchor', () => {
    expect(freqToMidi(440)).toBeCloseTo(69, 10);
  });

  it('round-trips with midiToFreq across the range', () => {
    for (const midi of [0, 21, 60, 69, 108, 127]) {
      expect(freqToMidi(midiToFreq(midi))).toBeCloseTo(midi, 10);
    }
  });
});

describe('midiToName', () => {
  it('names the standard reference notes', () => {
    expect(midiToName(69)).toBe('A4');
    expect(midiToName(60)).toBe('C4');
    expect(midiToName(21)).toBe('A0'); // lowest piano key
    expect(midiToName(108)).toBe('C8'); // highest piano key
  });

  it('handles sharps and octave boundaries', () => {
    expect(midiToName(61)).toBe('C#4');
    expect(midiToName(59)).toBe('B3');
    expect(midiToName(12)).toBe('C0');
    expect(midiToName(0)).toBe('C-1');
  });
});
