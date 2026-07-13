import { useMemo, useRef } from 'react';
import { DRUM_LANE_NAMES } from '../../audio/instruments/drums';
import { getAudioOutput } from '../../audio/output';
import { previewNote } from '../../audio/preview';
import { Playhead } from '../../components/Playhead';
import { DEFAULT_VELOCITY, TOTAL_STEPS } from '../../model/project';
import { useProjectStore } from '../../store/projectStore';

const CELL_W = 24;
const ROW_H = 36;
const HEADER_H = 24;
const GRID_WIDTH = TOTAL_STEPS * CELL_W;

/** 表示順（上から）: Crash / HH Open / HH Close / Cowbell / Tom / Clap / Snare / Kick */
const LANES = [6, 3, 2, 7, 4, 5, 1, 0] as const;

/** 小節境界は濃く、拍は中間、その他は薄い罫線（SPECIFICATION.md §5.2） */
function cellBorderClass(step: number): string {
  if (step % 16 === 0) return 'border-l-2 border-l-ink';
  if (step % 4 === 0) return 'border-l border-l-shade';
  return 'border-l border-l-tone';
}

export function DrumGrid() {
  const notes = useProjectStore((s) => s.project.tracks[3]!.notes);
  const addNote = useProjectStore((s) => s.addNote);
  const removeNote = useProjectStore((s) => s.removeNote);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // ドラッグ連続入力: pointerdown 時の操作（追加/削除）を維持したまま塗る
  const paintingRef = useRef<{ add: boolean; lastLane: number; lastStep: number } | null>(null);

  const onSteps = useMemo(() => new Set(notes.map((n) => `${n.step}:${n.pitch}`)), [notes]);

  const apply = (lane: number, step: number, add: boolean) => {
    const has = onSteps.has(`${step}:${lane}`);
    if (add && !has) {
      addNote('drums', { step, pitch: lane, length: 1, velocity: DEFAULT_VELOCITY });
      const { ctx, master } = getAudioOutput();
      previewNote(ctx, master, 'drums', lane);
    } else if (!add && has) {
      removeNote('drums', step, lane);
    }
  };

  const cellFromEvent = (e: React.PointerEvent): { lane: number; step: number } | null => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const step = Math.floor((e.clientX - rect.left) / CELL_W);
    const row = Math.floor((e.clientY - rect.top - HEADER_H) / ROW_H);
    if (step < 0 || step >= TOTAL_STEPS || row < 0 || row >= LANES.length) return null;
    return { lane: LANES[row]!, step };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = cellFromEvent(e);
    if (!cell) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const add = !onSteps.has(`${cell.step}:${cell.lane}`);
    paintingRef.current = { add, lastLane: cell.lane, lastStep: cell.step };
    apply(cell.lane, cell.step, add);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const painting = paintingRef.current;
    if (!painting) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    // 速いドラッグでもセルが飛ばないよう、同一レーン内は前回位置から補間する
    if (cell.lane === painting.lastLane) {
      const from = Math.min(painting.lastStep, cell.step);
      const to = Math.max(painting.lastStep, cell.step);
      for (let s = from; s <= to; s++) apply(cell.lane, s, painting.add);
    } else {
      apply(cell.lane, cell.step, painting.add);
    }
    painting.lastLane = cell.lane;
    painting.lastStep = cell.step;
  };

  const endPaint = () => {
    paintingRef.current = null;
  };

  return (
    <div className="flex border-2 border-ink">
      {/* レーンラベル */}
      <div className="shrink-0 border-r-2 border-ink bg-tone">
        <div className="h-6 border-b border-shade" />
        {LANES.map((lane) => (
          <div key={lane} className="flex h-9 items-center border-b border-shade px-2 text-sm last:border-b-0">
            {DRUM_LANE_NAMES[lane]}
          </div>
        ))}
      </div>

      {/* グリッド本体 */}
      <div ref={scrollRef} className="relative overflow-x-auto">
        <div
          ref={gridRef}
          className="relative touch-none"
          style={{ width: GRID_WIDTH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPaint}
          onPointerCancel={endPaint}
        >
          {/* 小節番号 */}
          <div className="flex h-6 border-b border-shade">
            {Array.from({ length: 8 }, (_, bar) => (
              <div
                key={bar}
                className="flex items-center border-l-2 border-l-ink pl-1 font-num text-[10px]"
                style={{ width: CELL_W * 16 }}
              >
                {bar + 1}
              </div>
            ))}
          </div>

          {LANES.map((lane) => (
            <div key={lane} className="flex h-9 border-b border-shade last:border-b-0">
              {Array.from({ length: TOTAL_STEPS }, (_, step) => {
                const on = onSteps.has(`${step}:${lane}`);
                return (
                  <div
                    key={step}
                    className={`${cellBorderClass(step)} h-full select-none ${
                      on ? 'bg-ink' : 'bg-paper hover:bg-tone'
                    }`}
                    style={{ width: CELL_W }}
                  />
                );
              })}
            </div>
          ))}

          <Playhead scrollRef={scrollRef} cellWidth={CELL_W} />
        </div>
      </div>
    </div>
  );
}
