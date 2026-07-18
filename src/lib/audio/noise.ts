import { getAudioContext } from './context';

export type NoiseColor = 'white' | 'pink';

const cache = new Map<NoiseColor, AudioBuffer>();

/**
 * A 2-second buffer of noise, cached per color. White = independent random
 * samples (flat spectrum). Pink = -3 dB/octave (equal energy per octave),
 * via Paul Kellet's filter approximation.
 */
export function getNoiseBuffer(color: NoiseColor): AudioBuffer {
  const cached = cache.get(color);
  if (cached) return cached;
  const ctx = getAudioContext();
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (color === 'white') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  cache.set(color, buf);
  return buf;
}

/** A looping source node over the cached noise buffer (start/stop it yourself). */
export function createNoiseSource(color: NoiseColor): AudioBufferSourceNode {
  const ctx = getAudioContext();
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(color);
  src.loop = true;
  return src;
}
