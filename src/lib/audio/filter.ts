import { getAudioContext } from './context';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass';

export const FILTER_TYPES: { value: FilterType; label: string }[] = [
  { value: 'lowpass', label: 'Low-pass' },
  { value: 'highpass', label: 'High-pass' },
  { value: 'bandpass', label: 'Band-pass' },
];

export function createFilter(type: FilterType, frequency: number, q: number): BiquadFilterNode {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  return filter;
}

/** Log-spaced frequency axis from `min`..`max` Hz with `n` points. */
export function logFreqAxis(min = 20, max = 20000, n = 256): Float32Array<ArrayBuffer> {
  const out = new Float32Array(n);
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  for (let i = 0; i < n; i++) {
    out[i] = Math.pow(10, logMin + ((logMax - logMin) * i) / (n - 1));
  }
  return out;
}

/**
 * Sample a biquad's magnitude response (in dB) along a frequency axis,
 * without affecting the live audio graph.
 */
export function filterResponseDb(
  type: FilterType,
  frequency: number,
  q: number,
  freqs: Float32Array<ArrayBuffer>,
): Float32Array {
  const ctx = getAudioContext();
  const probe = ctx.createBiquadFilter();
  probe.type = type;
  probe.frequency.value = frequency;
  probe.Q.value = q;
  const mag = new Float32Array(freqs.length);
  const phase = new Float32Array(freqs.length);
  probe.getFrequencyResponse(freqs, mag, phase);
  const db = new Float32Array(freqs.length);
  for (let i = 0; i < mag.length; i++) {
    db[i] = 20 * Math.log10(Math.max(1e-5, mag[i]));
  }
  return db;
}
