import { getPulseWave, scheduleSteppedDecay } from '../consoles';
import { midiToFreq } from '../pitch';
import type { InstrumentPlayer } from './types';

// 矩形波 50% + 速いディケイでピアノらしい減衰を作る（famicom）
export const playPiano: InstrumentPlayer = (ctx, destination, { time, pitch, velocity, duration }) => {
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(getPulseWave(ctx, 0.5));
  osc.frequency.value = midiToFreq(pitch);

  const gain = ctx.createGain();
  const decay = Math.min(duration, 0.7);
  gain.gain.setValueAtTime(0, time);
  scheduleSteppedDecay(gain.gain, velocity * 0.5, time, decay);
  gain.gain.setValueAtTime(0, time + decay);

  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + decay + 0.05);
};
