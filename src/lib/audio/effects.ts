import { getAudioContext } from './context';

/**
 * Effect units for the Effects module: each is input -> [dry + wet paths] -> output,
 * with live setters (setTargetAtTime) so controls modulate the running sound.
 * Wet/dry mix is linear: dry = 1 - mix, wet = mix.
 */
export interface Effect {
  readonly input: GainNode;
  readonly output: GainNode;
  dispose(): void;
}

const T = 0.02; // smoothing time-constant for live param changes

abstract class WetDry implements Effect {
  readonly input: GainNode;
  readonly output: GainNode;
  protected dry: GainNode;
  protected wet: GainNode;

  constructor(mix: number) {
    const ctx = getAudioContext();
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();
    this.dry.gain.value = 1 - mix;
    this.wet.gain.value = mix;
    this.input.connect(this.dry);
    this.dry.connect(this.output);
    this.wet.connect(this.output);
  }

  set mix(m: number) {
    const t = getAudioContext().currentTime;
    this.dry.gain.setTargetAtTime(1 - m, t, T);
    this.wet.gain.setTargetAtTime(m, t, T);
  }

  dispose(): void {
    for (const n of this.nodes()) n.disconnect();
  }
  protected nodes(): AudioNode[] {
    return [this.input, this.output, this.dry, this.wet];
  }
}

/** input -> delay -> wet, with delay -> feedback -> delay. */
export class FeedbackDelay extends WetDry {
  private delay: DelayNode;
  private fb: GainNode;

  constructor(time = 0.35, feedback = 0.4, mix = 0.5) {
    super(mix);
    const ctx = getAudioContext();
    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = time;
    this.fb = ctx.createGain();
    this.fb.gain.value = feedback;
    this.input.connect(this.delay);
    this.delay.connect(this.wet);
    this.delay.connect(this.fb);
    this.fb.connect(this.delay);
  }

  set time(s: number) {
    this.delay.delayTime.setTargetAtTime(s, getAudioContext().currentTime, T);
  }
  set feedback(g: number) {
    this.fb.gain.setTargetAtTime(Math.min(g, 0.95), getAudioContext().currentTime, T);
  }
  /** The delay-time AudioParam, exposed as a modulation target. */
  get timeParam(): AudioParam {
    return this.delay.delayTime;
  }
  protected nodes(): AudioNode[] {
    return [...super.nodes(), this.delay, this.fb];
  }
}

/**
 * A biquad filter wrapped in the Effect interface so it can sit in a chain
 * alongside the wet/dry units (no mix — a filter is inline by nature).
 */
export class FilterEffect implements Effect {
  readonly input: GainNode;
  readonly output: GainNode;
  private biquad: BiquadFilterNode;

  constructor(type: BiquadFilterType = 'lowpass', cutoff = 2200, resonance = 1) {
    const ctx = getAudioContext();
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.biquad = ctx.createBiquadFilter();
    this.biquad.type = type;
    this.biquad.frequency.value = cutoff;
    this.biquad.Q.value = resonance;
    this.input.connect(this.biquad);
    this.biquad.connect(this.output);
  }

  set cutoff(hz: number) {
    this.biquad.frequency.setTargetAtTime(hz, getAudioContext().currentTime, T);
  }
  set resonance(q: number) {
    this.biquad.Q.setTargetAtTime(q, getAudioContext().currentTime, T);
  }
  /** The cutoff AudioParam, exposed as a modulation target. */
  get cutoffParam(): AudioParam {
    return this.biquad.frequency;
  }

  dispose(): void {
    this.input.disconnect();
    this.biquad.disconnect();
    this.output.disconnect();
  }
}

/**
 * One short delay whose time is wobbled by an LFO. Base ~20 ms = chorus;
 * base a few ms + feedback = flanger. Depth is clamped below base so the
 * delay time never goes negative.
 */
export class Chorus extends WetDry {
  private delay: DelayNode;
  private fb: GainNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private _base: number;
  private _depth: number;

  constructor(rate = 0.8, depth = 0.004, base = 0.02, feedback = 0, mix = 0.5) {
    super(mix);
    const ctx = getAudioContext();
    this._base = base;
    this._depth = depth;
    this.delay = ctx.createDelay(0.1);
    this.delay.delayTime.value = base;
    this.fb = ctx.createGain();
    this.fb.gain.value = feedback;
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = rate;
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = this.clampedDepth();
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delay.delayTime);
    this.input.connect(this.delay);
    this.delay.connect(this.wet);
    this.delay.connect(this.fb);
    this.fb.connect(this.delay);
    this.lfo.start();
  }

  private clampedDepth(): number {
    return Math.min(this._depth, this._base * 0.9);
  }
  private apply(): void {
    const t = getAudioContext().currentTime;
    this.delay.delayTime.setTargetAtTime(this._base, t, T);
    this.lfoGain.gain.setTargetAtTime(this.clampedDepth(), t, T);
  }

  set rate(hz: number) {
    this.lfo.frequency.setTargetAtTime(hz, getAudioContext().currentTime, T);
  }
  set depth(s: number) {
    this._depth = s;
    this.apply();
  }
  set base(s: number) {
    this._base = s;
    this.apply();
  }
  set feedback(g: number) {
    this.fb.gain.setTargetAtTime(Math.min(g, 0.9), getAudioContext().currentTime, T);
  }

  dispose(): void {
    try {
      this.lfo.stop();
    } catch {
      /* already stopped */
    }
    super.dispose();
  }
  protected nodes(): AudioNode[] {
    return [...super.nodes(), this.delay, this.fb, this.lfo, this.lfoGain];
  }
}

/** WaveShaper with a tanh curve; drive steepens the curve toward hard clipping. */
export class Distortion extends WetDry {
  private shaper: WaveShaperNode;

  constructor(drive = 8, mix = 1) {
    super(mix);
    const ctx = getAudioContext();
    this.shaper = ctx.createWaveShaper();
    this.shaper.oversample = '4x';
    this.drive = drive;
    this.input.connect(this.shaper);
    this.shaper.connect(this.wet);
  }

  set drive(k: number) {
    const n = 2048;
    const curve = new Float32Array(n);
    const norm = Math.tanh(k);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x) / norm;
    }
    this.shaper.curve = curve;
  }
  protected nodes(): AudioNode[] {
    return [...super.nodes(), this.shaper];
  }
}

/** Convolution reverb; the impulse response is generated (decaying noise burst). */
export class Reverb extends WetDry {
  private convolver: ConvolverNode;
  private _seconds: number;
  private _decay: number;

  constructor(seconds = 2, decay = 3, mix = 0.4) {
    super(mix);
    const ctx = getAudioContext();
    this._seconds = seconds;
    this._decay = decay;
    this.convolver = ctx.createConvolver();
    this.rebuild();
    this.input.connect(this.convolver);
    this.convolver.connect(this.wet);
  }

  private rebuild(): void {
    const ctx = getAudioContext();
    const len = Math.max(1, Math.floor(this._seconds * ctx.sampleRate));
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, this._decay);
      }
    }
    this.convolver.buffer = buf;
  }

  set seconds(s: number) {
    this._seconds = s;
    this.rebuild();
  }
  set decay(d: number) {
    this._decay = d;
    this.rebuild();
  }
  protected nodes(): AudioNode[] {
    return [...super.nodes(), this.convolver];
  }
}
