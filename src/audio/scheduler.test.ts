import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialProject } from '../model/project';
import { Scheduler, audibleTrackIds, stepDurationSec, stepToPosition } from './scheduler';

describe('stepDurationSec', () => {
  it('BPM 120 で 16 分音符は 0.125 秒', () => {
    expect(stepDurationSec(120)).toBe(0.125);
  });

  it('BPM 60 で 0.25 秒', () => {
    expect(stepDurationSec(60)).toBe(0.25);
  });
});

describe('stepToPosition', () => {
  it('先頭は 1:1', () => {
    expect(stepToPosition(0)).toEqual({ bar: 1, beat: 1 });
  });

  it('ステップ 20 は 2 小節目の 2 拍目', () => {
    expect(stepToPosition(20)).toEqual({ bar: 2, beat: 2 });
  });

  it('最終ステップ 127 は 8:4', () => {
    expect(stepToPosition(127)).toEqual({ bar: 8, beat: 4 });
  });
});

describe('audibleTrackIds', () => {
  it('デフォルトは全トラック', () => {
    expect(audibleTrackIds(createInitialProject()).size).toBe(4);
  });

  it('mute したトラックは除外される', () => {
    const project = createInitialProject();
    project.tracks[0]!.mute = true;
    const audible = audibleTrackIds(project);
    expect(audible.has('piano')).toBe(false);
    expect(audible.size).toBe(3);
  });

  it('solo があれば solo トラックのみ', () => {
    const project = createInitialProject();
    project.tracks[1]!.solo = true;
    const audible = audibleTrackIds(project);
    expect([...audible]).toEqual(['guitar']);
  });
});

describe('Scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(options: { bpm?: number; lookaheadSec?: number } = {}) {
    const ctx = { currentTime: 0 };
    const scheduled: { step: number; time: number; stepDuration: number }[] = [];
    let bpm = options.bpm ?? 120;
    const scheduler = new Scheduler({
      ctx,
      getBpm: () => bpm,
      scheduleStep: (step, time, stepDuration) => scheduled.push({ step, time, stepDuration }),
      lookaheadSec: options.lookaheadSec ?? 0.1,
    });
    return { ctx, scheduled, scheduler, setBpm: (v: number) => (bpm = v) };
  }

  it('start 直後に lookahead 分だけ先読みスケジュールされる', () => {
    const { scheduled, scheduler } = setup({ lookaheadSec: 0.5 });
    scheduler.start();
    // 開始オフセット 0.05 から 0.125 間隔で 0.5 未満まで → 4 ステップ
    expect(scheduled.map((s) => s.step)).toEqual([0, 1, 2, 3]);
    expect(scheduled[0]).toEqual({ step: 0, time: 0.05, stepDuration: 0.125 });
    scheduler.stop();
  });

  it('時間が進むと続きのステップが予約され、128 でループする', () => {
    const { ctx, scheduled, scheduler } = setup({ lookaheadSec: 0.1 });
    scheduler.start();
    ctx.currentTime = 16; // 128 ステップ（16 秒）を超えた位置まで進める
    scheduler.tick();
    const steps = scheduled.map((s) => s.step);
    expect(steps[steps.length - 1]).toBe((steps.length - 1) % 128);
    expect(steps.length).toBeGreaterThan(128);
    expect(steps[128]).toBe(0); // 1 周して先頭に戻る
    scheduler.stop();
  });

  it('BPM 変更は次のステップから反映される', () => {
    const { ctx, scheduled, scheduler, setBpm } = setup({ bpm: 120, lookaheadSec: 0.1 });
    scheduler.start();
    const before = scheduled.length;
    setBpm(240);
    ctx.currentTime = 0.5;
    scheduler.tick();
    expect(scheduled[before]!.stepDuration).toBe(stepDurationSec(240));
    expect(scheduled[before - 1]!.stepDuration).toBe(stepDurationSec(120));
    scheduler.stop();
  });

  it('getCurrentStep は再生時刻に応じたステップを返す', () => {
    const { ctx, scheduler } = setup({ lookaheadSec: 0.5 });
    scheduler.start();
    expect(scheduler.getCurrentStep()).toBe(0);
    ctx.currentTime = 0.2; // 0.05 + 0.125 = 0.175 を過ぎた → ステップ 1
    scheduler.tick();
    expect(scheduler.getCurrentStep()).toBe(1);
    scheduler.stop();
  });

  it('stop で isPlaying が false になる', () => {
    const { scheduler } = setup();
    scheduler.start();
    expect(scheduler.isPlaying).toBe(true);
    scheduler.stop();
    expect(scheduler.isPlaying).toBe(false);
  });
});
