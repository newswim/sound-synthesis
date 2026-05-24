import { describe, expect, it } from 'vitest';
import { DEFAULT_ADSR, envelopePoints, type ADSR } from './envelope';

describe('envelopePoints', () => {
  const env: ADSR = { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.4 };

  it('starts at the origin and ends silent', () => {
    const pts = envelopePoints(env);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts.at(-1)).toEqual({ x: 1, y: 0 });
  });

  it('produces monotonically non-decreasing x in [0,1]', () => {
    const pts = envelopePoints(env);
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
    }
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].x).toBeGreaterThanOrEqual(pts[i - 1].x);
    }
  });

  it('peaks at 1 after attack, then holds the sustain level', () => {
    const pts = envelopePoints(env);
    expect(pts[1].y).toBe(1);
    expect(pts[2].y).toBe(env.sustain);
    expect(pts[3].y).toBe(env.sustain);
  });

  it('places stage boundaries at the correct normalized times', () => {
    const holdSec = 0.4;
    const total = env.attack + env.decay + holdSec + env.release;
    const pts = envelopePoints(env, holdSec);
    expect(pts[1].x).toBeCloseTo(env.attack / total, 10);
    expect(pts[2].x).toBeCloseTo((env.attack + env.decay) / total, 10);
    expect(pts[3].x).toBeCloseTo((env.attack + env.decay + holdSec) / total, 10);
  });

  it('works with the default ADSR', () => {
    const pts = envelopePoints(DEFAULT_ADSR);
    expect(pts).toHaveLength(5);
    expect(pts[2].y).toBe(DEFAULT_ADSR.sustain);
  });
});
