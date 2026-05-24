import { describe, expect, it } from 'vitest';
import { logFreqAxis } from './filter';

describe('logFreqAxis', () => {
  it('spans exactly from min to max inclusive', () => {
    const axis = logFreqAxis(20, 20000, 256);
    expect(axis).toHaveLength(256);
    expect(axis[0]).toBeCloseTo(20, 6);
    expect(axis.at(-1)).toBeCloseTo(20000, 6);
  });

  it('is strictly increasing', () => {
    const axis = logFreqAxis(20, 20000, 256);
    for (let i = 1; i < axis.length; i++) {
      expect(axis[i]).toBeGreaterThan(axis[i - 1]);
    }
  });

  it('is evenly spaced in log space (constant ratio between steps)', () => {
    const axis = logFreqAxis(20, 20000, 64);
    const firstRatio = axis[1] / axis[0];
    for (let i = 1; i < axis.length; i++) {
      expect(axis[i] / axis[i - 1]).toBeCloseTo(firstRatio, 6);
    }
  });

  it('honors custom bounds and point counts', () => {
    const axis = logFreqAxis(100, 1000, 3);
    expect(axis).toHaveLength(3);
    expect(axis[0]).toBeCloseTo(100, 6);
    expect(axis[1]).toBeCloseTo(Math.sqrt(100 * 1000), 3); // geometric midpoint (float32)
    expect(axis[2]).toBeCloseTo(1000, 6);
  });
});
