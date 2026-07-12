import { useCallback, useEffect, useRef } from 'react';
import { scheduleMetronomeClick } from '../../audio/metronome';
import { getAudioOutput } from '../../audio/output';
import { Scheduler, scheduleProjectStep } from '../../audio/scheduler';
import { usePlaybackStore } from '../../store/playbackStore';
import { useProjectStore } from '../../store/projectStore';

interface ActivePlayback {
  scheduler: Scheduler;
  /** 停止時に切断して、先読み済みの音も止めるためのゲート */
  gate: GainNode;
  rafId: number;
}

export function useTransport(): { play: () => void; stop: () => void; toggle: () => void } {
  const activeRef = useRef<ActivePlayback | null>(null);

  const stop = useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    active.scheduler.stop();
    active.gate.disconnect();
    cancelAnimationFrame(active.rafId);
    activeRef.current = null;
    usePlaybackStore.getState().setPlaying(false);
    usePlaybackStore.getState().setCurrentStep(0);
  }, []);

  const play = useCallback(() => {
    if (activeRef.current) return;
    const { ctx, master } = getAudioOutput();
    const gate = ctx.createGain();
    gate.connect(master);

    const scheduler = new Scheduler({
      ctx,
      getBpm: () => useProjectStore.getState().project.bpm,
      scheduleStep: (step, time, stepDuration) => {
        scheduleProjectStep(ctx, gate, useProjectStore.getState().project, step, time, stepDuration);
        if (usePlaybackStore.getState().metronomeEnabled && step % 4 === 0) {
          scheduleMetronomeClick(ctx, gate, time, step % 16 === 0);
        }
      },
    });
    scheduler.start();

    const updatePlayhead = () => {
      const active = activeRef.current;
      if (!active) return;
      usePlaybackStore.getState().setCurrentStep(active.scheduler.getCurrentStep());
      active.rafId = requestAnimationFrame(updatePlayhead);
    };
    activeRef.current = { scheduler, gate, rafId: requestAnimationFrame(updatePlayhead) };
    usePlaybackStore.getState().setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) {
      stop();
    } else {
      play();
    }
  }, [play, stop]);

  // アンマウント時に再生を止める
  useEffect(() => stop, [stop]);

  return { play, stop, toggle };
}
