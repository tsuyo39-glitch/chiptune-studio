import { getNoiseBuffer } from '../consoles';
import type { InstrumentPlayer } from './types';

export const DRUM_LANE_NAMES = [
  'Kick',
  'Snare',
  'HH Close',
  'HH Open',
  'Tom',
  'Clap',
  'Crash',
  'Cowbell',
] as const;

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

/** 三角波の急速ピッチ下降（キック・タム共用） */
function playPitchDrop(
  ctx: BaseAudioContext,
  destination: AudioNode,
  time: number,
  peak: number,
  fromHz: number,
  toHz: number,
  dropSec: number,
  decay: number,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(fromHz, time);
  osc.frequency.exponentialRampToValueAtTime(toHz, time + dropSec);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peak, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  gain.gain.setValueAtTime(0, time + decay);

  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + decay + 0.03);
}

function playKick(ctx: BaseAudioContext, destination: AudioNode, time: number, velocity: number): void {
  playPitchDrop(ctx, destination, time, velocity, 160, 45, 0.12, 0.22);
  // 低域ノイズ短発でアタックを足す
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

/** 短いノイズを 3 連発させる手拍子 */
function playClap(ctx: BaseAudioContext, destination: AudioNode, time: number, velocity: number): void {
  playNoise(ctx, destination, time, velocity * 0.9, 0.02, 'bandpass', 1200);
  playNoise(ctx, destination, time + 0.02, velocity * 0.9, 0.02, 'bandpass', 1200);
  playNoise(ctx, destination, time + 0.04, velocity, 0.14, 'bandpass', 1200);
}

/** 2 つの矩形波によるカウベル（540Hz + 800Hz） */
function playCowbell(ctx: BaseAudioContext, destination: AudioNode, time: number, velocity: number): void {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity * 0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
  gain.gain.setValueAtTime(0, time + 0.14);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 700;
  filter.Q.value = 1.5;

  filter.connect(gain).connect(destination);
  for (const freq of [540, 800]) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start(time);
    osc.stop(time + 0.16);
  }
}

// レーン: 0=Kick / 1=Snare / 2=HH Close / 3=HH Open / 4=Tom / 5=Clap / 6=Crash / 7=Cowbell
// （SPECIFICATION.md §4.2）
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
    case 4:
      playPitchDrop(ctx, destination, time, velocity * 0.8, 240, 110, 0.15, 0.3);
      break;
    case 5:
      playClap(ctx, destination, time, velocity);
      break;
    case 6:
      playNoise(ctx, destination, time, velocity * 0.5, 0.9, 'highpass', 5000);
      break;
    case 7:
      playCowbell(ctx, destination, time, velocity);
      break;
  }
};
