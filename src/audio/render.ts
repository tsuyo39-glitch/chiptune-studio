// OfflineAudioContext によるエクスポート用レンダリング（SPECIFICATION.md §4.4）。
// リアルタイム再生と同じ scheduleProjectStep / 楽器コードを使う。

import { TOTAL_STEPS, type Project } from '../model/project';
import { createConsoleChain } from './consoles';
import { MASTER_GAIN } from './mix';
import { scheduleProjectStep, stepDurationSec } from './scheduler';
import { audioBufferToWavBlob } from './wav';

export const EXPORT_SAMPLE_RATE = 44100;

/** リリース余韻（秒）。ループ 1 周分の後に付ける */
const RELEASE_TAIL_SEC = 1;

export async function renderProject(project: Project): Promise<AudioBuffer> {
  const stepDuration = stepDurationSec(project.bpm);
  const durationSec = TOTAL_STEPS * stepDuration + RELEASE_TAIL_SEC;
  const ctx = new OfflineAudioContext(
    2,
    Math.ceil(durationSec * EXPORT_SAMPLE_RATE),
    EXPORT_SAMPLE_RATE,
  );

  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(ctx.destination);
  const chain = createConsoleChain(ctx, project.consoleMode, master);

  for (let step = 0; step < TOTAL_STEPS; step++) {
    scheduleProjectStep(ctx, chain, project, step, step * stepDuration, stepDuration);
  }
  return ctx.startRendering();
}

/** プロジェクトを 44.1kHz / 16bit / ステレオの WAV に書き出す */
export async function renderProjectToWav(project: Project): Promise<Blob> {
  return audioBufferToWavBlob(await renderProject(project));
}
