export interface PlayParams {
  /** AudioContext 時刻（秒）での発音開始 */
  time: number;
  /** MIDI ノート番号。drums はレーン番号（0–3） */
  pitch: number;
  /** 0–1 */
  velocity: number;
  /** 発音の長さ（秒）。ワンショット系は無視してよい */
  duration: number;
}

/**
 * 楽器の発音関数。リアルタイム再生とオフラインレンダリングで
 * 同じコードを使うため ctx を引数で受け取る（SPECIFICATION.md §4.4）。
 */
export type InstrumentPlayer = (
  ctx: BaseAudioContext,
  destination: AudioNode,
  params: PlayParams,
) => void;
