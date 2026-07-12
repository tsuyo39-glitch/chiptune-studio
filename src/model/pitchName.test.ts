import { describe, expect, it } from 'vitest';
import { isBlackKey, midiNoteName } from './pitchName';

describe('midiNoteName', () => {
  it('C4 = 60', () => {
    expect(midiNoteName(60)).toBe('C4');
  });

  it('A4 = 69', () => {
    expect(midiNoteName(69)).toBe('A4');
  });

  it('C#2 = 37', () => {
    expect(midiNoteName(37)).toBe('C#2');
  });
});

describe('isBlackKey', () => {
  it('C は白鍵、C# は黒鍵', () => {
    expect(isBlackKey(60)).toBe(false);
    expect(isBlackKey(61)).toBe(true);
  });
});
