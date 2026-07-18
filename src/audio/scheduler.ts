// lookahead 方式のステップスケジューラ（SPECIFICATION.md §4.3）。
// setInterval で先読みし、AudioContext.currentTime 基準で発音時刻を確定する。
// requestAnimationFrame は使わない（UI のプレイヘッド表示のみに使う）。

import { STEPS_PER_BAR, TOTAL_STEPS, type Project, type TrackId } from '../model/project';
import { instruments } from './instruments';
import { balancedVelocity } from './mix';

/** 16 分音符 1 ステップの長さ（秒） */
export function stepDurationSec(bpm: number): number {
  return 60 / bpm / 4;
}

/** ステップ → 再生位置表示用の小節:拍（どちらも 1 始まり） */
export function stepToPosition(step: number): { bar: number; beat: number } {
  return {
    bar: Math.floor(step / STEPS_PER_BAR) + 1,
    beat: Math.floor((step % STEPS_PER_BAR) / 4) + 1,
  };
}

/** solo があれば solo トラックのみ、なければ mute 以外を鳴らす */
export function audibleTrackIds(project: Project): Set<TrackId> {
  const solo = project.tracks.filter((t) => t.solo);
  const audible = solo.length > 0 ? solo : project.tracks.filter((t) => !t.mute);
  return new Set(audible.map((t) => t.id));
}

/** step 位置から始まるノートをすべて発音予約する。再生・エクスポート共用 */
export function scheduleProjectStep(
  ctx: BaseAudioContext,
  destination: AudioNode,
  project: Project,
  step: number,
  time: number,
  stepDuration: number,
): void {
  const audible = audibleTrackIds(project);
  for (const track of project.tracks) {
    if (!audible.has(track.id)) continue;
    for (const note of track.notes) {
      if (note.step !== step) continue;
      instruments[track.id](ctx, destination, {
        time,
        pitch: note.pitch,
        velocity: balancedVelocity(track.id, note.velocity * track.volume),
        duration: note.length * stepDuration,
      });
    }
  }
}

export interface SchedulerOptions {
  /** currentTime だけ使うので実体は AudioContext / テスト用フェイクのどちらでもよい */
  ctx: { currentTime: number };
  getBpm: () => number;
  /** 各ステップの発音予約。ノート・メトロノームの中身は呼び出し側が決める */
  scheduleStep: (step: number, time: number, stepDuration: number) => void;
  lookaheadSec?: number;
  intervalMs?: number;
}

export class Scheduler {
  private readonly opts: SchedulerOptions;
  private nextStep = 0;
  private nextStepTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  /** プレイヘッド表示用に、予約済みステップと時刻を保持する */
  private scheduled: { step: number; time: number }[] = [];

  constructor(opts: SchedulerOptions) {
    this.opts = opts;
  }

  get isPlaying(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer) return;
    this.nextStep = 0;
    this.nextStepTime = this.opts.ctx.currentTime + 0.05;
    this.scheduled = [];
    this.timer = setInterval(() => this.tick(), this.opts.intervalMs ?? 25);
    this.tick();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.scheduled = [];
  }

  /** lookahead 区間に入ったステップを発音予約する */
  tick(): void {
    const ahead = this.opts.ctx.currentTime + (this.opts.lookaheadSec ?? 0.1);
    while (this.nextStepTime < ahead) {
      // BPM はステップごとに参照する = 変更は次のステップから反映（§4.3）
      const stepDuration = stepDurationSec(this.opts.getBpm());
      this.opts.scheduleStep(this.nextStep, this.nextStepTime, stepDuration);
      this.scheduled.push({ step: this.nextStep, time: this.nextStepTime });
      this.nextStep = (this.nextStep + 1) % TOTAL_STEPS;
      this.nextStepTime += stepDuration;
    }
    // 再生済みエントリを掃除（現在ステップの判定用に直近 1 件は残す）
    const now = this.opts.ctx.currentTime;
    while (this.scheduled.length > 1 && this.scheduled[1]!.time <= now) {
      this.scheduled.shift();
    }
  }

  /** UI プレイヘッド用の現在再生中ステップ */
  getCurrentStep(): number {
    const now = this.opts.ctx.currentTime;
    let current = this.scheduled[0]?.step ?? 0;
    for (const s of this.scheduled) {
      if (s.time > now) break;
      current = s.step;
    }
    return current;
  }
}
