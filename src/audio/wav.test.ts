import { describe, expect, it } from 'vitest';
import { encodeWavPcm16 } from './wav';

function ascii(view: DataView, offset: number, length: number): string {
  return Array.from({ length }, (_, i) => String.fromCharCode(view.getUint8(offset + i))).join('');
}

describe('encodeWavPcm16', () => {
  it('RIFF/WAVE ヘッダーと fmt チャンクが正しい', () => {
    const view = new DataView(encodeWavPcm16([new Float32Array(4), new Float32Array(4)], 44100));
    expect(ascii(view, 0, 4)).toBe('RIFF');
    expect(ascii(view, 8, 4)).toBe('WAVE');
    expect(ascii(view, 12, 4)).toBe('fmt ');
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(2); // ステレオ
    expect(view.getUint32(24, true)).toBe(44100);
    expect(view.getUint32(28, true)).toBe(44100 * 4); // byte rate
    expect(view.getUint16(34, true)).toBe(16); // ビット深度
    expect(ascii(view, 36, 4)).toBe('data');
  });

  it('サイズ計算: 44 バイトヘッダー + フレーム数 × 4 バイト', () => {
    const frames = 10;
    const buffer = encodeWavPcm16([new Float32Array(frames), new Float32Array(frames)], 44100);
    expect(buffer.byteLength).toBe(44 + frames * 4);
    expect(new DataView(buffer).getUint32(40, true)).toBe(frames * 4);
  });

  it('サンプルは int16 にスケールされ、チャンネルがインターリーブされる', () => {
    const left = new Float32Array([0.5, -0.5]);
    const right = new Float32Array([1, -1]);
    const view = new DataView(encodeWavPcm16([left, right], 44100));
    expect(view.getInt16(44, true)).toBe(16383); // trunc(0.5 * 0x7fff)
    expect(view.getInt16(46, true)).toBe(0x7fff); // R ch が続く
    expect(view.getInt16(48, true)).toBe(-0.5 * 0x8000);
    expect(view.getInt16(50, true)).toBe(-0x8000);
  });

  it('±1 を超える値はクリップされる', () => {
    const view = new DataView(encodeWavPcm16([new Float32Array([2, -2])], 44100));
    expect(view.getInt16(44, true)).toBe(0x7fff);
    expect(view.getInt16(46, true)).toBe(-0x8000);
  });
});
