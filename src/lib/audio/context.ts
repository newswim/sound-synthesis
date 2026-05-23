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
 * On iOS, Web Audio defaults to an audio session that is silenced by the
 * hardware mute switch (unlike <video>/<audio> media playback). Declaring the
 * session as "playback" (Safari 16.4+) makes our output behave like media:
 * it plays through the media volume and ignores the mute switch.
 */
function declarePlaybackSession(): void {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) {
    try {
      nav.audioSession.type = 'playback';
    } catch {
      /* unsupported value — ignore */
    }
  }
}

/**
 * Lazily create the shared AudioContext. The graph is:
 *   ...sources -> masterGain -> limiter -> destination
 * A limiter guards against harsh/loud output while experimenting.
 */
export function getAudioContext(): AudioContext {
  if (!ctx) {
    declarePlaybackSession();
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

let pinged = false;

/**
 * Play a one-sample silent buffer. iOS/WebKit only fully unlocks audio output
 * if some sound is started inside the first user gesture — this is that sound.
 */
function playSilentPing(c: AudioContext): void {
  try {
    const buffer = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    src.start(0);
  } catch {
    /* ignore — best-effort unlock */
  }
}

/**
 * Must run inside a user gesture. Resumes the context (autoplay policy; also
 * recovers from WebKit's "interrupted" state) and flips `audioReady` to true.
 */
export async function unlockAudio(): Promise<AudioContext> {
  const c = getAudioContext();
  // Fire the silent ping synchronously, before any await, so it stays inside
  // the user gesture (required by WebKit).
  if (!pinged) {
    playSilentPing(c);
    pinged = true;
  }
  if (c.state !== 'running' && c.state !== 'closed') {
    await c.resume();
  }
  ready.set(c.state === 'running');
  return c;
}

/**
 * Resume audio on the first user interaction anywhere on the page, and again
 * after the OS interrupts/suspends it (backgrounding, phone calls on mobile).
 * Listeners are passive and idempotent, so they can stay attached.
 */
export function installGlobalAudioUnlock(): void {
  if (typeof window === 'undefined') return;
  const handler = () => void unlockAudio();
  const opts: AddEventListenerOptions = { passive: true };
  for (const ev of ['pointerdown', 'touchend', 'mousedown', 'keydown']) {
    window.addEventListener(ev, handler, opts);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
  });
}

export function now(): number {
  return getAudioContext().currentTime;
}
