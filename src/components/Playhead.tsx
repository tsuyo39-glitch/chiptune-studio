import { useEffect } from 'react';
import { usePlaybackStore } from '../store/playbackStore';

interface PlayheadProps {
  /** 横スクロールコンテナ（自動追従に使う） */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  cellWidth: number;
  /** スクロールコンテナ内でグリッド左端より手前にある固定領域（ラベル列など）の幅 */
  offsetLeft?: number;
}

/** 再生中のプレイヘッド。グリッド相対で配置し、自動横スクロールで追従する */
export function Playhead({ scrollRef, cellWidth, offsetLeft = 0 }: PlayheadProps) {
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const currentStep = usePlaybackStore((s) => s.currentStep);
  const x = currentStep * cellWidth;

  useEffect(() => {
    const container = scrollRef.current;
    if (!isPlaying || !container) return;
    const margin = cellWidth * 4;
    const viewLeft = container.scrollLeft + offsetLeft;
    const viewRight = container.scrollLeft + container.clientWidth;
    if (x < viewLeft + margin || x > viewRight - margin) {
      container.scrollLeft = Math.max(0, x - offsetLeft - margin);
    }
  }, [isPlaying, x, cellWidth, offsetLeft, scrollRef]);

  if (!isPlaying) return null;
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-accent"
      style={{ left: x }}
    />
  );
}
