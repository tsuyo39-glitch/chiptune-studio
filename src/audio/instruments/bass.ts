import { midiToFreq } from '../pitch';
import type { InstrumentPlayer } from './types';

// 三角波・1 オクターブ下・サステイン型エンベロープ（famicom）
export const playBass: InstrumentPlayer = (ctx, destination, { time, pitch, velocity, duration }) => {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = midiToFreq(pitch - 12);

  const gain = ctx.createGain();
  const level = velocity * 0.6;
  const release = 0.06;
  gain.gain.setValueAtTime(0, time);
  gain.gain.setValueAtTime(level, time + 0.005);
  gain.gain.setValueAtTime(level, time + duration);
  gain.gain.linearRampToValueAtTime(0, time + duration + release);

  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + duration + release + 0.05);
};
