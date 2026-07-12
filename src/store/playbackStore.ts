import { create } from 'zustand';

// 再生まわりの一時状態。プロジェクトデータ（projectStore）には含めない。
interface PlaybackStore {
  isPlaying: boolean;
  metronomeEnabled: boolean;
  /** プレイヘッド表示用の現在ステップ（rAF で更新される） */
  currentStep: number;
  setPlaying: (isPlaying: boolean) => void;
  toggleMetronome: () => void;
  setCurrentStep: (step: number) => void;
}

export const usePlaybackStore = create<PlaybackStore>()((set) => ({
  isPlaying: false,
  metronomeEnabled: false,
  currentStep: 0,
  setPlaying: (isPlaying) => set({ isPlaying }),
  toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),
  setCurrentStep: (currentStep) => set({ currentStep }),
}));
