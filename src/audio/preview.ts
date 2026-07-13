import type { ConsoleMode, TrackId } from '../model/project';
import { createConsoleChain } from './consoles';
import { instruments } from './instruments';

/** ノート追加時・試聴ボタン用の単音プレビュー。コンソールモードの質感も反映する */
export function previewNote(
  ctx: BaseAudioContext,
  destination: AudioNode,
  trackId: TrackId,
  pitch: number,
  mode: ConsoleMode = 'famicom',
): void {
  instruments[trackId](ctx, createConsoleChain(ctx, mode, destination), {
    time: ctx.currentTime + 0.01,
    pitch,
    velocity: 0.8,
    duration: 0.5,
  });
}
