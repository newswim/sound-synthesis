import { writable, type Readable } from 'svelte/store';

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let limiter: DynamicsCompressorNode | null = null;
let masterAnalyser: AnalyserNode | null = null;

const ready = writable(false);

/** True once the AudioContext is running (after the first user gesture). */
export const audioReady: Readable<boolean> = { subscribe: ready.subscribe };

/** Master output volume, 0..1. Kept conservative for safe learning. */
const masterVolume = writable(0.7);
export const masterVolumeStore = masterVolume;

/**
 * Lazily create the shared AudioContext. The graph is:
 *   ...sources -> masterGain -> limiter -> destination
 * A limiter guards against harsh/loud output while experimenting.
 */
export function getAudioContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;

    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;

    masterGain.connect(limiter);
    limiter.connect(ctx.destination);

    masterVolume.subscribe((v) => {
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.01);
      }
    });
  }
  return ctx;
}

/** The node every sound source should connect to instead of `destination`. */
export function getMasterBus(): GainNode {
  getAudioContext();
  return masterGain!;
}

/** A side-chain analyser tapping the full mix, for whole-output visualizers. */
export function getMasterAnalyser(): AnalyserNode {
  getAudioContext();
  if (!masterAnalyser) {
    masterAnalyser = ctx!.createAnalyser();
    masterAnalyser.fftSize = 2048;
    masterGain!.connect(masterAnalyser); // tap only; output left unconnected
  }
  return masterAnalyser;
}

/**
 * Must run inside a user gesture. Resumes a suspended context (autoplay policy)
 * and flips `audioReady` to true.
 */
export async function unlockAudio(): Promise<AudioContext> {
  const c = getAudioContext();
  if (c.state === 'suspended') {
    await c.resume();
  }
  ready.set(c.state === 'running');
  return c;
}

export function now(): number {
  return getAudioContext().currentTime;
}
