import { getAudioContext, getMasterBus } from './context';
import type { Waveform } from './oscillator';

/**
 * A simple continuously-playing tone: osc -> gain -> analyser -> master.
 * Used by the lessons that just need "a note you can see and tweak live".
 */
export class Tone {
  private osc: OscillatorNode | null = null;
  private gain: GainNode;
  readonly analyser: AnalyserNode;
  private _freq = 440;
  private _amp = 0.4;
  private _type: Waveform = 'sine';
  private _wave: PeriodicWave | null = null;

  constructor() {
    const ctx = getAudioContext();
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.gain.connect(this.analyser);
    this.analyser.connect(getMasterBus());
  }

  get playing(): boolean {
    return this.osc !== null;
  }

  start(): void {
    if (this.osc) return;
    const ctx = getAudioContext();
    this.osc = ctx.createOscillator();
    this.applyType();
    this.osc.frequency.value = this._freq;
    this.osc.connect(this.gain);
    this.osc.start();
    this.gain.gain.setTargetAtTime(this._amp, ctx.currentTime, 0.02);
  }

  stop(): void {
    if (!this.osc) return;
    const ctx = getAudioContext();
    this.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
    const osc = this.osc;
    this.osc = null;
    osc.stop(ctx.currentTime + 0.1);
    osc.onended = () => osc.disconnect();
  }

  private applyType(): void {
    if (!this.osc) return;
    if (this._wave) this.osc.setPeriodicWave(this._wave);
    else this.osc.type = this._type;
  }

  set frequency(hz: number) {
    this._freq = hz;
    if (this.osc) this.osc.frequency.setTargetAtTime(hz, getAudioContext().currentTime, 0.01);
  }
  set amplitude(a: number) {
    this._amp = a;
    if (this.osc) this.gain.gain.setTargetAtTime(a, getAudioContext().currentTime, 0.02);
  }
  set waveform(t: Waveform) {
    this._type = t;
    this._wave = null;
    this.applyType();
  }
  set periodicWave(w: PeriodicWave) {
    this._wave = w;
    this.applyType();
  }

  dispose(): void {
    this.stop();
    this.gain.disconnect();
    this.analyser.disconnect();
  }
}
