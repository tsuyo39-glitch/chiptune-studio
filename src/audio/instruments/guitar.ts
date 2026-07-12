import { getPulseWave, scheduleSteppedDecay } from '../consoles';
import { midiToFreq } from '../pitch';
import type { InstrumentPlayer } from './types';

// 矩形波 25% + 中程度のディケイ + 軽いビブラート（famicom）
export const playGuitar: InstrumentPlayer = (ctx, destination, { time, pitch, velocity, duration }) => {
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(getPulseWave(ctx, 0.25));
  osc.frequency.value = midiToFreq(pitch);

  // ビブラート: 6Hz / ±12 セントを detune に加える（立ち上がりから少し遅らせる）
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 6;
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0, time);
  lfoGain.gain.setValueAtTime(12, time + 0.12);
  lfo.connect(lfoGain).connect(osc.detune);

  const gain = ctx.createGain();
  const decay = Math.min(Math.max(duration, 0.4), 1.2);
  gain.gain.setValueAtTime(0, time);
  scheduleSteppedDecay(gain.gain, velocity * 0.45, time, decay, 12);
  gain.gain.setValueAtTime(0, time + decay);

  osc.connect(gain).connect(destination);
  const stopAt = time + decay + 0.05;
  osc.start(time);
  osc.stop(stopAt);
  lfo.start(time);
  lfo.stop(stopAt);
};
