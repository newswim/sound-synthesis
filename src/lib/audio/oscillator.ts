import { getAudioContext } from './context';

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export const WAVEFORMS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'sawtooth', label: 'Saw' },
  { value: 'triangle', label: 'Triangle' },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** MIDI note number -> frequency in Hz (A4 = MIDI 69 = 440 Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** MIDI note number -> name like "A4". */
export function midiToName(midi: number): string {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

/** Frequency in Hz -> nearest MIDI note number (float). */
export function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/**
 * Build a custom PeriodicWave from harmonic amplitudes.
 * `amplitudes[k]` is the level of the (k+1)-th harmonic (index 0 = fundamental).
 */
export function buildPeriodicWave(amplitudes: number[]): PeriodicWave {
  const ctx = getAudioContext();
  const n = amplitudes.length + 1;
  const real = new Float32Array(n); // cosine terms (unused, 0)
  const imag = new Float32Array(n); // sine terms
  for (let k = 0; k < amplitudes.length; k++) {
    imag[k + 1] = amplitudes[k];
  }
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}
