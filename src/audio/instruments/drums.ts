import { getNoiseBuffer } from '../consoles';
import type { InstrumentPlayer } from './types';

export const DRUM_LANE_NAMES = ['キック', 'スネア', 'ハット閉', 'ハット開'] as const;

function playNoise(
  ctx: BaseAudioContext,
  destination: AudioNode,
  time: number,
  peak: number,
  decay: number,
  filterType: BiquadFilterType,
  frequency: number,
): void {
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = frequency;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peak, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  gain.gain.setValueAtTime(0, time + decay);

  source.connect(filter).connect(gain).connect(destination);
  source.start(time);
  source.stop(time + decay + 0.02);
}

function playKick(ctx: BaseAudioContext, destination: AudioNode, time: number, velocity: number): void {
  // 三角波の急速ピッチ下降
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  gain.gain.setValueAtTime(0, time + 0.22);

  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + 0.25);

  // 低域ノイズ短発
  playNoise(ctx, destination, time, velocity * 0.4, 0.05, 'lowpass', 300);
}

function playSnare(ctx: BaseAudioContext, destination: AudioNode, time: number, velocity: number): void {
  // 中域ノイズ
  playNoise(ctx, destination, time, velocity * 0.7, 0.16, 'bandpass', 1800);

  // 短い矩形波で胴鳴りを足す
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 180;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity * 0.25, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  gain.gain.setValueAtTime(0, time + 0.08);
  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + 0.1);
}

// レーン: 0=キック / 1=スネア / 2=ハイハット閉 / 3=ハイハット開（SPECIFICATION.md §4.2）
export const playDrums: InstrumentPlayer = (ctx, destination, { time, pitch, velocity }) => {
  switch (pitch) {
    case 0:
      playKick(ctx, destination, time, velocity);
      break;
    case 1:
      playSnare(ctx, destination, time, velocity);
      break;
    case 2:
      playNoise(ctx, destination, time, velocity * 0.5, 0.04, 'highpass', 7000);
      break;
    case 3:
      playNoise(ctx, destination, time, velocity * 0.5, 0.3, 'highpass', 7000);
      break;
  }
};
