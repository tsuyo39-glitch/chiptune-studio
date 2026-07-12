// Project データモデル（SPECIFICATION.md §3）。React / Zustand に依存しない純粋 TS。

export type ConsoleMode = 'famicom' | 'superfamicom' | 'gameboy';

export const CONSOLE_MODES = ['famicom', 'superfamicom', 'gameboy'] as const;

export const TRACK_IDS = ['piano', 'guitar', 'bass', 'drums'] as const;
export type TrackId = (typeof TRACK_IDS)[number];

export const STEPS_PER_BAR = 16;
export const BAR_COUNT = 8;
export const TOTAL_STEPS = STEPS_PER_BAR * BAR_COUNT; // 128

export const BPM_MIN = 40;
export const BPM_MAX = 240;
export const DEFAULT_BPM = 120;

/** drums トラックのレーン数（pitch 0–3 をレーン番号として使う） */
export const DRUM_LANE_COUNT = 4;

/** MIDI ノート番号の有効範囲 */
export const PITCH_MIN = 0;
export const PITCH_MAX = 127;

export interface Note {
  step: number; // 0–127（開始位置）
  pitch: number; // MIDI ノート番号。drums はレーン番号（0–3）
  length: number; // ステップ数（drums は常に 1）
  velocity: number; // 0–1
}

export interface Track {
  id: TrackId;
  volume: number; // 0–1
  mute: boolean;
  solo: boolean;
  notes: Note[];
}

export interface Project {
  version: 1;
  title: string;
  bpm: number; // 40–240
  consoleMode: ConsoleMode;
  tracks: Track[]; // 固定 4 トラック（TRACK_IDS の順）
}

export function clampBpm(bpm: number): number {
  if (Number.isNaN(bpm)) return DEFAULT_BPM;
  return Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(bpm)));
}

export function createInitialProject(): Project {
  return {
    version: 1,
    title: 'untitled',
    bpm: DEFAULT_BPM,
    consoleMode: 'famicom',
    tracks: TRACK_IDS.map((id) => ({
      id,
      volume: 0.8,
      mute: false,
      solo: false,
      notes: [],
    })),
  };
}

export type ValidationResult =
  | { ok: true; project: Project }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateNote(value: unknown, trackId: TrackId, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path}: ノートがオブジェクトではありません`);
    return;
  }
  const { step, pitch, length, velocity } = value;
  if (!isFiniteNumber(step) || !Number.isInteger(step) || step < 0 || step >= TOTAL_STEPS) {
    errors.push(`${path}.step: 0–${TOTAL_STEPS - 1} の整数である必要があります`);
  }
  if (trackId === 'drums') {
    if (!isFiniteNumber(pitch) || !Number.isInteger(pitch) || pitch < 0 || pitch >= DRUM_LANE_COUNT) {
      errors.push(`${path}.pitch: drums のレーン番号は 0–${DRUM_LANE_COUNT - 1} です`);
    }
    if (length !== 1) {
      errors.push(`${path}.length: drums のノート長は常に 1 です`);
    }
  } else {
    if (!isFiniteNumber(pitch) || !Number.isInteger(pitch) || pitch < PITCH_MIN || pitch > PITCH_MAX) {
      errors.push(`${path}.pitch: MIDI ノート番号（${PITCH_MIN}–${PITCH_MAX}）である必要があります`);
    }
    if (!isFiniteNumber(length) || !Number.isInteger(length) || length < 1) {
      errors.push(`${path}.length: 1 以上の整数である必要があります`);
    } else if (isFiniteNumber(step) && Number.isInteger(step) && step >= 0 && step + length > TOTAL_STEPS) {
      errors.push(`${path}: ノートが ${TOTAL_STEPS} ステップの範囲を超えています`);
    }
  }
  if (!isFiniteNumber(velocity) || velocity < 0 || velocity > 1) {
    errors.push(`${path}.velocity: 0–1 の数値である必要があります`);
  }
}

function validateTrack(value: unknown, index: number, errors: string[]): void {
  const path = `tracks[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${path}: トラックがオブジェクトではありません`);
    return;
  }
  const expectedId = TRACK_IDS[index];
  if (value.id !== expectedId) {
    errors.push(`${path}.id: "${expectedId}" である必要があります`);
    return;
  }
  if (!isFiniteNumber(value.volume) || value.volume < 0 || value.volume > 1) {
    errors.push(`${path}.volume: 0–1 の数値である必要があります`);
  }
  if (typeof value.mute !== 'boolean') {
    errors.push(`${path}.mute: 真偽値である必要があります`);
  }
  if (typeof value.solo !== 'boolean') {
    errors.push(`${path}.solo: 真偽値である必要があります`);
  }
  if (!Array.isArray(value.notes)) {
    errors.push(`${path}.notes: 配列である必要があります`);
    return;
  }
  value.notes.forEach((note, i) => {
    validateNote(note, expectedId, `${path}.notes[${i}]`, errors);
  });
}

/** JSON 読み込みなど外部由来のデータを Project として検証する */
export function validateProject(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return { ok: false, errors: ['プロジェクトデータがオブジェクトではありません'] };
  }
  if (data.version !== 1) {
    errors.push('version: 1 のみ対応しています');
  }
  if (typeof data.title !== 'string') {
    errors.push('title: 文字列である必要があります');
  }
  if (!isFiniteNumber(data.bpm) || data.bpm < BPM_MIN || data.bpm > BPM_MAX) {
    errors.push(`bpm: ${BPM_MIN}–${BPM_MAX} の数値である必要があります`);
  }
  if (!CONSOLE_MODES.includes(data.consoleMode as ConsoleMode)) {
    errors.push(`consoleMode: ${CONSOLE_MODES.join(' / ')} のいずれかである必要があります`);
  }
  if (!Array.isArray(data.tracks) || data.tracks.length !== TRACK_IDS.length) {
    errors.push(`tracks: ${TRACK_IDS.length} トラックの配列である必要があります`);
  } else {
    data.tracks.forEach((track, i) => {
      validateTrack(track, i, errors);
    });
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, project: data as unknown as Project };
}
