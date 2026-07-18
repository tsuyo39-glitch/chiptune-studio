import { useEffect, useRef } from 'react';
import { getAudioOutput } from '../../audio/output';
import { previewNote } from '../../audio/preview';
import { Playhead } from '../../components/Playhead';
import { isBlackKey, midiNoteName } from '../../model/pitchName';
import { DEFAULT_VELOCITY, TOTAL_STEPS, TRACK_IDS, type Note } from '../../model/project';
import { useProjectStore } from '../../store/projectStore';

export type PitchedTrackId = 'piano' | 'guitar' | 'bass';

const CELL_W = 24;
const ROW_H = 16;
const HEADER_H = 24;
const LABEL_W = 48;
const VIEW_H = 384;
const GRID_WIDTH = TOTAL_STEPS * CELL_W;

/** 表示範囲は C2–C6、bass のみ C1–C4（SPECIFICATION.md §5.2） */
const RANGES: Record<PitchedTrackId, { min: number; max: number }> = {
  piano: { min: 36, max: 84 },
  guitar: { min: 36, max: 84 },
  bass: { min: 24, max: 60 },
};

type DragState =
  | { mode: 'resize'; index: number; noteStep: number; changed: boolean; noteStepPitch: [number, number] }
  | {
      mode: 'move';
      index: number;
      grabOffset: number;
      moved: boolean;
      lastPitch: number;
      noteStepPitch: [number, number];
    };

function preview(trackId: PitchedTrackId, pitch: number): void {
  const { ctx, master } = getAudioOutput();
  previewNote(ctx, master, trackId, pitch, useProjectStore.getState().project.consoleMode);
}

export function PianoRoll({ trackId }: { trackId: PitchedTrackId }) {
  const trackIndex = TRACK_IDS.indexOf(trackId);
  const notes = useProjectStore((s) => s.project.tracks[trackIndex]!.notes);
  const addNote = useProjectStore((s) => s.addNote);
  const removeNote = useProjectStore((s) => s.removeNote);
  const updateNoteAt = useProjectStore((s) => s.updateNoteAt);

  const { min, max } = RANGES[trackId];
  const rowCount = max - min + 1;
  const gridHeight = rowCount * ROW_H;
  const pitchToRow = (pitch: number) => max - pitch;
  const rowToPitch = (row: number) => max - row;

  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // 最新の notes をハンドラから参照する（ドラッグ中は毎レンダー張り替えない）
  const notesRef = useRef<Note[]>(notes);
  notesRef.current = notes;

  // 初期表示: C4（bass は C3）付近が見えるようにスクロール
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const center = trackId === 'bass' ? 48 : 60;
    const centerRow = RANGES[trackId].max - center;
    container.scrollTop = Math.max(0, centerRow * ROW_H - (VIEW_H - HEADER_H) / 2);
  }, [trackId]);

  const cellFromEvent = (e: React.PointerEvent): { step: number; pitch: number; fracX: number } | null => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const step = Math.floor(x / CELL_W);
    const row = Math.floor(y / ROW_H);
    if (step < 0 || step >= TOTAL_STEPS || row < 0 || row >= rowCount) return null;
    return { step, pitch: rowToPitch(row), fracX: x / CELL_W - step };
  };

  const noteIndexAt = (step: number, pitch: number): number =>
    notesRef.current.findIndex((n) => n.pitch === pitch && step >= n.step && step < n.step + n.length);

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = cellFromEvent(e);
    if (!cell) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const index = noteIndexAt(cell.step, cell.pitch);
    if (index >= 0) {
      const note = notesRef.current[index]!;
      const onRightEdge = cell.step === note.step + note.length - 1 && cell.fracX > 0.5;
      dragRef.current = onRightEdge
        ? { mode: 'resize', index, noteStep: note.step, changed: false, noteStepPitch: [note.step, note.pitch] }
        : {
            mode: 'move',
            index,
            grabOffset: cell.step - note.step,
            moved: false,
            lastPitch: note.pitch,
            noteStepPitch: [note.step, note.pitch],
          };
      return;
    }

    // 空きセル: ノート追加（デフォルト長 1）+ プレビュー。そのままドラッグで長さ調整できる
    addNote(trackId, { step: cell.step, pitch: cell.pitch, length: 1, velocity: DEFAULT_VELOCITY });
    preview(trackId, cell.pitch);
    dragRef.current = {
      mode: 'resize',
      index: notesRef.current.length, // set 反映前なので追加後のインデックス
      noteStep: cell.step,
      changed: true, // 新規追加はクリック=削除の対象にしない
      noteStepPitch: [cell.step, cell.pitch],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    const note = notesRef.current[drag.index];
    if (!note) return;

    if (drag.mode === 'resize') {
      const length = Math.max(1, Math.min(cell.step - drag.noteStep + 1, TOTAL_STEPS - drag.noteStep));
      if (length !== note.length) {
        updateNoteAt(trackId, drag.index, { length });
        drag.changed = true;
      }
    } else {
      const step = Math.max(0, Math.min(cell.step - drag.grabOffset, TOTAL_STEPS - note.length));
      const pitch = Math.max(min, Math.min(cell.pitch, max));
      if (step !== note.step || pitch !== note.pitch) {
        updateNoteAt(trackId, drag.index, { step, pitch });
        drag.moved = true;
        if (pitch !== drag.lastPitch) {
          preview(trackId, pitch);
          drag.lastPitch = pitch;
        }
      }
    }
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    // ドラッグせずに離した = クリック → ノート削除
    const clicked = drag.mode === 'move' ? !drag.moved : !drag.changed;
    if (clicked) {
      const note = notesRef.current[drag.index];
      if (note) removeNote(trackId, note.step, note.pitch);
    }
  };

  return (
    <div ref={scrollRef} className="relative overflow-auto border-2 border-ink" style={{ height: VIEW_H }}>
      <div style={{ width: LABEL_W + GRID_WIDTH, height: HEADER_H + gridHeight }}>
        {/* ヘッダー（小節番号、縦スクロールに追従） */}
        <div className="sticky top-0 z-20 flex" style={{ height: HEADER_H }}>
          <div
            className="sticky left-0 z-30 shrink-0 border-r-2 border-b border-ink bg-tone"
            style={{ width: LABEL_W }}
          />
          <div className="flex border-b border-shade bg-paper">
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
        </div>

        <div className="flex">
          {/* 音名ラベル列（横スクロールに追従） */}
          <div className="sticky left-0 z-10 shrink-0 border-r-2 border-ink bg-tone" style={{ width: LABEL_W }}>
            {Array.from({ length: rowCount }, (_, row) => {
              const pitch = rowToPitch(row);
              return (
                <div
                  key={pitch}
                  className={`flex items-center px-1 font-num text-[9px] ${
                    pitch % 12 === 11 ? 'border-t border-ink' : ''
                  } ${isBlackKey(pitch) ? 'bg-shade/30' : ''}`}
                  style={{ height: ROW_H }}
                >
                  {pitch % 12 === 0 ? midiNoteName(pitch) : ''}
                </div>
              );
            })}
          </div>

          {/* グリッド本体 */}
          <div
            ref={gridRef}
            className="relative touch-none"
            style={{ width: GRID_WIDTH, height: gridHeight }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* 行ストライプ（黒鍵行 + オクターブ境界） */}
            {Array.from({ length: rowCount }, (_, row) => {
              const pitch = rowToPitch(row);
              return (
                <div
                  key={pitch}
                  className={`${isBlackKey(pitch) ? 'bg-tone/60' : ''} ${
                    pitch % 12 === 11 ? 'border-t border-ink' : 'border-t border-tone/60'
                  }`}
                  style={{ height: ROW_H }}
                />
              );
            })}

            {/* 縦罫線（小節・拍・ステップの濃淡） */}
            {Array.from({ length: TOTAL_STEPS }, (_, step) => (
              <div
                key={step}
                className={`pointer-events-none absolute top-0 bottom-0 ${
                  step % 16 === 0 ? 'w-[2px] bg-ink' : step % 4 === 0 ? 'w-[1px] bg-shade' : 'w-[1px] bg-tone'
                }`}
                style={{ left: step * CELL_W }}
              />
            ))}

            {/* ノート */}
            {notes.map((note, i) => (
              <div
                key={i}
                className="absolute border-2 border-ink bg-accent"
                style={{
                  left: note.step * CELL_W,
                  top: pitchToRow(note.pitch) * ROW_H + 1,
                  width: note.length * CELL_W,
                  height: ROW_H - 2,
                }}
              >
                {/* 右端の長さ変更ハンドル（見た目上の目印） */}
                <div className="absolute top-0 bottom-0 right-0 w-[6px] cursor-ew-resize bg-ink/30" />
              </div>
            ))}

            <Playhead scrollRef={scrollRef} cellWidth={CELL_W} offsetLeft={LABEL_W} />
          </div>
        </div>
      </div>
    </div>
  );
}
