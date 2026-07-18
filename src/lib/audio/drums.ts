import { getAudioContext, getMasterBus } from './context';
import { createNoiseSource } from './noise';

/**
 * One-shot drum voices. Params are read at trigger time; nodes are discarded
 * after each hit (oscillators/buffer sources are one-shot by design).
 */

const EPS = 1e-4;

/** Kick: a sine whose *pitch* gets an envelope — the fast drop is the thump. */
export function playKick(
  opts: { startFreq?: number; decay?: number } = {},
  destination: AudioNode = getMasterBus(),
): void {
  const { startFreq = 160, decay = 0.4 } = opts;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + decay * 0.5);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.9, t);
  amp.gain.exponentialRampToValueAtTime(EPS, t + decay);
  osc.connect(amp);
  amp.connect(destination);
  osc.start(t);
  osc.stop(t + decay + 0.05);
  osc.onended = () => {
    osc.disconnect();
    amp.disconnect();
  };
}

/** Snare: a short tonal knock plus a burst of high-passed white noise. */
export function playSnare(
  opts: { tone?: number; decay?: number } = {},
  destination: AudioNode = getMasterBus(),
): void {
  const { tone = 190, decay = 0.18 } = opts;
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = tone;
  const oscAmp = ctx.createGain();
  oscAmp.gain.setValueAtTime(0.5, t);
  oscAmp.gain.exponentialRampToValueAtTime(EPS, t + decay * 0.6);
  osc.connect(oscAmp);
  oscAmp.connect(destination);
  osc.start(t);
  osc.stop(t + decay);

  const noise = createNoiseSource('white');
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1500;
  const noiseAmp = ctx.createGain();
  noiseAmp.gain.setValueAtTime(0.6, t);
  noiseAmp.gain.exponentialRampToValueAtTime(EPS, t + decay);
  noise.connect(hp);
  hp.connect(noiseAmp);
  noiseAmp.connect(destination);
  noise.start(t);
  noise.stop(t + decay + 0.02);

  osc.onended = () => {
    osc.disconnect();
    oscAmp.disconnect();
  };
  noise.onended = () => {
    noise.disconnect();
    hp.disconnect();
    noiseAmp.disconnect();
  };
}

/** Hi-hat: high-passed noise; tiny decay reads "closed", longer reads "open". */
export function playHat(
  opts: { decay?: number; cutoff?: number } = {},
  destination: AudioNode = getMasterBus(),
): void {
  const { decay = 0.06, cutoff = 7000 } = opts;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const noise = createNoiseSource('white');
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = cutoff;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.4, t);
  amp.gain.exponentialRampToValueAtTime(EPS, t + decay);
  noise.connect(hp);
  hp.connect(amp);
  amp.connect(destination);
  noise.start(t);
  noise.stop(t + decay + 0.02);
  noise.onended = () => {
    noise.disconnect();
    hp.disconnect();
    amp.disconnect();
  };
}
