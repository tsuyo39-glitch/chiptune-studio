import { describe, expect, it } from 'vitest';
import { makeBitcrushCurve } from './consoles';

describe('makeBitcrushCurve', () => {
  it('指定した段数に量子化される', () => {
    const curve = makeBitcrushCurve(16);
    const distinct = new Set(curve);
    expect(distinct.size).toBe(16);
  });

  it('端点は ±1 で、単調非減少', () => {
    const curve = makeBitcrushCurve(16);
    expect(curve[0]).toBe(-1);
    expect(curve[curve.length - 1]).toBe(1);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i]!).toBeGreaterThanOrEqual(curve[i - 1]!);
    }
  });

  it('全値が [-1, 1] に収まる', () => {
    for (const v of makeBitcrushCurve(4)) {
      expect(Math.abs(v)).toBeLessThanOrEqual(1);
    }
  });
});
