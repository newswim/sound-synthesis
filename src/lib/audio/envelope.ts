export interface ADSR {
  /** seconds to rise from 0 to peak */
  attack: number;
  /** seconds to fall from peak to sustain */
  decay: number;
  /** sustain level, 0..1 */
  sustain: number;
  /** seconds to fall from sustain to 0 after release */
  release: number;
}

export const DEFAULT_ADSR: ADSR = {
  attack: 0.01,
  decay: 0.2,
  sustain: 0.6,
  release: 0.4,
};

const EPS = 1e-4; // exponential ramps cannot reach 0

/**
 * Schedule the attack/decay/sustain stages on a gain param.
 * `peak` is the velocity-scaled top of the envelope (0..1).
 */
export function triggerAttack(param: AudioParam, t0: number, env: ADSR, peak = 1): void {
  const sustainLevel = Math.max(EPS, env.sustain * peak);
  param.cancelScheduledValues(t0);
  param.setValueAtTime(EPS, t0);
  param.linearRampToValueAtTime(Math.max(EPS, peak), t0 + env.attack);
  param.exponentialRampToValueAtTime(sustainLevel, t0 + env.attack + env.decay);
}

/** Schedule the release stage starting at `t0`. Returns when the tail ends. */
export function triggerRelease(param: AudioParam, t0: number, env: ADSR): number {
  const current = param.value;
  param.cancelScheduledValues(t0);
  param.setValueAtTime(Math.max(EPS, current), t0);
  param.exponentialRampToValueAtTime(EPS, t0 + env.release);
  param.setValueAtTime(0, t0 + env.release + 0.001);
  return t0 + env.release + 0.001;
}

/**
 * Sample the envelope shape into [x,y] points for drawing.
 * The sustain segment is held for `holdSec`, then release is appended.
 */
export function envelopePoints(env: ADSR, holdSec = 0.4): { x: number; y: number }[] {
  const a = env.attack;
  const d = env.decay;
  const r = env.release;
  const total = a + d + holdSec + r;
  return [
    { x: 0, y: 0 },
    { x: a / total, y: 1 },
    { x: (a + d) / total, y: env.sustain },
    { x: (a + d + holdSec) / total, y: env.sustain },
    { x: 1, y: 0 },
  ];
}
