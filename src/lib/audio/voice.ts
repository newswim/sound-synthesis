import { getAudioContext, getMasterBus } from './context';
import { midiToFreq, type Waveform } from './oscillator';
import { triggerAttack, triggerRelease, type ADSR } from './envelope';
import { createFilter, type FilterType } from './filter';

export interface VoiceConfig {
  waveform: Waveform;
  detune: number; // cents
  filterType: FilterType;
  cutoff: number; // Hz
  resonance: number; // Q
  env: ADSR;
  lfoRate: number; // Hz, vibrato
  lfoDepth: number; // Hz of pitch deviation
}

/**
 * A single playable voice for the capstone: osc -> filter -> ampEnv -> master.
 * An optional vibrato LFO modulates the oscillator frequency.
 */
export class Voice {
  private osc: OscillatorNode;
  private filter: BiquadFilterNode;
  private amp: GainNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private cfg: VoiceConfig;
  private peak = 1;
  private sustainAt = 0;
  readonly midi: number;

  constructor(midi: number, cfg: VoiceConfig) {
    const ctx = getAudioContext();
    this.midi = midi;
    this.cfg = cfg;

    this.osc = ctx.createOscillator();
    this.osc.type = cfg.waveform;
    this.osc.frequency.value = midiToFreq(midi);
    this.osc.detune.value = cfg.detune;

    this.filter = createFilter(cfg.filterType, cfg.cutoff, cfg.resonance);

    this.amp = ctx.createGain();
    this.amp.gain.value = 0.0001;

    // Always wired (depth 0 = silent) so depth can be raised mid-note.
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = cfg.lfoRate;
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = cfg.lfoDepth;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.osc.frequency);

    this.osc.connect(this.filter);
    this.filter.connect(this.amp);
    this.amp.connect(getMasterBus());
  }

  start(velocity = 1): void {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    this.peak = velocity;
    this.sustainAt = t + this.cfg.env.attack + this.cfg.env.decay;
    this.osc.start(t);
    this.lfo.start(t);
    triggerAttack(this.amp.gain, t, this.cfg.env, velocity);
  }

  /**
   * Apply config changes to the already-sounding voice. Attack/decay are
   * scheduled at start and stay fixed; sustain retargets live once the
   * decay stage has passed; release is read at stop() time.
   */
  update(cfg: VoiceConfig): void {
    const t = getAudioContext().currentTime;
    this.osc.type = cfg.waveform;
    this.osc.detune.setTargetAtTime(cfg.detune, t, 0.01);
    this.filter.type = cfg.filterType;
    this.filter.frequency.setTargetAtTime(cfg.cutoff, t, 0.01);
    this.filter.Q.setTargetAtTime(cfg.resonance, t, 0.01);
    this.lfo.frequency.setTargetAtTime(cfg.lfoRate, t, 0.01);
    this.lfoGain.gain.setTargetAtTime(cfg.lfoDepth, t, 0.01);
    if (t >= this.sustainAt && cfg.env.sustain !== this.cfg.env.sustain) {
      this.amp.gain.setTargetAtTime(Math.max(1e-4, cfg.env.sustain * this.peak), t, 0.02);
    }
    this.cfg = cfg;
  }

  /** Begin release; resolves/stops the nodes after the tail completes. */
  stop(): void {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const end = triggerRelease(this.amp.gain, t, this.cfg.env);
    this.osc.stop(end + 0.05);
    this.lfo.stop(end + 0.05);
    this.osc.onended = () => this.dispose();
  }

  private dispose(): void {
    this.osc.disconnect();
    this.filter.disconnect();
    this.amp.disconnect();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
  }
}
