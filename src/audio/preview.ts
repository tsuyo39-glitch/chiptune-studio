import type { TrackId } from '../model/project';
import { instruments } from './instruments';

/** ノート追加時・試聴ボタン用の単音プレビュー */
export function previewNote(
  ctx: BaseAudioContext,
  destination: AudioNode,
  trackId: TrackId,
  pitch: number,
): void {
  instruments[trackId](ctx, destination, {
    time: ctx.currentTime + 0.01,
    pitch,
    velocity: 0.8,
    duration: 0.5,
  });
}
