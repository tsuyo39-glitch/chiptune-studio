// 拍頭のクリック音。1 拍目は高い音、2–4 拍目は低い音（SPECIFICATION.md §4.3）。
// エクスポートには含めない（呼び出し側が再生時のみスケジュールする）。

export function scheduleMetronomeClick(
  ctx: BaseAudioContext,
  destination: AudioNode,
  time: number,
  accent: boolean,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = accent ? 1760 : 1175;

  const gain = ctx.createGain();
  // 編集中のガイドとして聞こえつつ、曲より前に出ない音量にする
  gain.gain.setValueAtTime(accent ? 0.16 : 0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  gain.gain.setValueAtTime(0, time + 0.03);

  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + 0.05);
}
