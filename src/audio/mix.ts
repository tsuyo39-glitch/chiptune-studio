import type { TrackId } from '../model/project';

/** 再生と WAV 書き出しで共用するマスター音量。重なった発音のクリップを避ける。 */
export const MASTER_GAIN = 0.4;

/**
 * 音源ごとの素の出力差を揃えるための補正値。
 * とくに複数ノードを重ねる drums と低域が強い bass を抑える。
 */
export const TRACK_MIX_GAIN: Record<TrackId, number> = {
  piano: 1,
  guitar: 1.1,
  bass: 0.75,
  drums: 0.55,
};

export function balancedVelocity(trackId: TrackId, velocity: number): number {
  return velocity * TRACK_MIX_GAIN[trackId];
}
