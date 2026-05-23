import { getAudioContext } from './context';
import type { Waveform } from './oscillator';

export interface Lfo {
  osc: OscillatorNode;
  depth: GainNode;
  /** Route the LFO to an AudioParam (e.g. oscillator frequency or a gain). */
  connect(param: AudioParam): void;
  start(): void;
  stop(): void;
}

/**
 * A low-frequency oscillator: osc -> depth(gain). Connecting `depth` to an
 * AudioParam adds a periodic offset of ±depth around the param's base value.
 */
export function createLfo(rate: number, depth: number, shape: Waveform = 'sine'): Lfo {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = shape;
  osc.frequency.value = rate;

  const depthGain = ctx.createGain();
  depthGain.gain.value = depth;
  osc.connect(depthGain);

  let started = false;
  return {
    osc,
    depth: depthGain,
    connect(param: AudioParam) {
      depthGain.connect(param);
    },
    start() {
      if (!started) {
        osc.start();
        started = true;
      }
    },
    stop() {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
      osc.disconnect();
      depthGain.disconnect();
    },
  };
}
