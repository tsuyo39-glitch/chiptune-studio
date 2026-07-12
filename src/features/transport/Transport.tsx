import { useEffect, useState } from 'react';
import { stepToPosition } from '../../audio/scheduler';
import { PixelButton } from '../../components/PixelButton';
import { BPM_MAX, BPM_MIN } from '../../model/project';
import { usePlaybackStore } from '../../store/playbackStore';
import { useProjectStore } from '../../store/projectStore';
import { useTransport } from './useTransport';

function BpmInput() {
  const bpm = useProjectStore((s) => s.project.bpm);
  const setBpm = useProjectStore((s) => s.setBpm);
  // 入力途中でクランプされると打ちにくいので、確定はブラー / Enter 時に行う
  const [draft, setDraft] = useState(String(bpm));

  useEffect(() => {
    setDraft(String(bpm));
  }, [bpm]);

  const commit = () => {
    const value = Number(draft);
    if (Number.isFinite(value)) {
      setBpm(value);
    } else {
      setDraft(String(bpm));
    }
  };

  return (
    <label className="flex items-center gap-2">
      BPM
      <input
        type="number"
        min={BPM_MIN}
        max={BPM_MAX}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="w-20 border-2 border-ink bg-paper px-2 py-1 font-num text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </label>
  );
}

export function Transport() {
  const { toggle } = useTransport();
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const metronomeEnabled = usePlaybackStore((s) => s.metronomeEnabled);
  const toggleMetronome = usePlaybackStore((s) => s.toggleMetronome);
  const currentStep = usePlaybackStore((s) => s.currentStep);
  const { bar, beat } = stepToPosition(currentStep);

  // スペースキーで再生/停止（入力欄フォーカス中は除く）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  return (
    <div className="flex flex-wrap items-center gap-4 border-b-2 border-ink px-4 py-3">
      <PixelButton
        variant={isPlaying ? 'accent' : 'normal'}
        onClick={toggle}
        aria-label={isPlaying ? '停止' : '再生'}
        className="w-14"
      >
        {isPlaying ? '■' : '▶'}
      </PixelButton>
      <BpmInput />
      <PixelButton variant={metronomeEnabled ? 'accent' : 'normal'} onClick={toggleMetronome}>
        メトロノーム
      </PixelButton>
      <span className="ml-auto font-num text-sm" aria-label="再生位置（小節:拍）">
        {bar}:{beat}
      </span>
    </div>
  );
}
