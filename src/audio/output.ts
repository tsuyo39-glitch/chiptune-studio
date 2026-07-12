// リアルタイム再生用の AudioContext シングルトン。
// ページロード時には作らず、最初のユーザー操作で生成・resume する（SPECIFICATION.md §12）。

export interface AudioOutput {
  ctx: AudioContext;
  master: GainNode;
}

let output: AudioOutput | null = null;

export function getAudioOutput(): AudioOutput {
  if (!output) {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    output = { ctx, master };
  }
  if (output.ctx.state === 'suspended') {
    void output.ctx.resume();
  }
  return output;
}
