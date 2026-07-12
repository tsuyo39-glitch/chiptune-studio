import { describe, expect, it } from 'vitest';
import { midiToFreq } from './pitch';

describe('midiToFreq', () => {
  it('A4 (69) は 440Hz', () => {
    expect(midiToFreq(69)).toBe(440);
  });

  it('オクターブで周波数が倍になる', () => {
    expect(midiToFreq(81)).toBe(880);
    expect(midiToFreq(57)).toBe(220);
  });

  it('C4 (60) はおよそ 261.63Hz', () => {
    expect(midiToFreq(60)).toBeCloseTo(261.63, 1);
  });
});
