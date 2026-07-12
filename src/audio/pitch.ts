/** MIDI ノート番号 → 周波数 (Hz)。A4 (69) = 440Hz */
export function midiToFreq(pitch: number): number {
  return 440 * 2 ** ((pitch - 69) / 12);
}
