import { describe, expect, it } from 'vitest';
import {
  BPM_MAX,
  BPM_MIN,
  DEFAULT_BPM,
  TOTAL_STEPS,
  TRACK_IDS,
  clampBpm,
  createInitialProject,
  validateProject,
  type Project,
} from './project';

function validProject(): Project {
  return createInitialProject();
}

describe('createInitialProject', () => {
  it('バリデーションを通る初期プロジェクトを返す', () => {
    const result = validateProject(createInitialProject());
    expect(result.ok).toBe(true);
  });

  it('4 トラックを固定順で持つ', () => {
    const project = createInitialProject();
    expect(project.tracks.map((t) => t.id)).toEqual([...TRACK_IDS]);
  });
});

describe('clampBpm', () => {
  it('範囲内はそのまま（整数に丸め）', () => {
    expect(clampBpm(120)).toBe(120);
    expect(clampBpm(120.4)).toBe(120);
  });

  it('範囲外はクランプする', () => {
    expect(clampBpm(1)).toBe(BPM_MIN);
    expect(clampBpm(999)).toBe(BPM_MAX);
  });

  it('NaN はデフォルト BPM になる', () => {
    expect(clampBpm(Number.NaN)).toBe(DEFAULT_BPM);
  });
});

describe('validateProject', () => {
  it('オブジェクトでないデータを拒否する', () => {
    for (const data of [null, undefined, 42, 'x', []]) {
      const result = validateProject(data);
      expect(result.ok).toBe(false);
    }
  });

  it('version が 1 以外なら拒否する', () => {
    const project = { ...validProject(), version: 2 };
    const result = validateProject(project);
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors.join()).toContain('version');
  });

  it('bpm が範囲外なら拒否する', () => {
    for (const bpm of [BPM_MIN - 1, BPM_MAX + 1, Number.NaN, '120']) {
      const result = validateProject({ ...validProject(), bpm });
      expect(result.ok).toBe(false);
    }
  });

  it('consoleMode が不正なら拒否する', () => {
    const result = validateProject({ ...validProject(), consoleMode: 'megadrive' });
    expect(result.ok).toBe(false);
  });

  it('トラックの欠落・順序違いを拒否する', () => {
    const base = validProject();
    expect(validateProject({ ...base, tracks: base.tracks.slice(0, 3) }).ok).toBe(false);
    expect(validateProject({ ...base, tracks: [...base.tracks].reverse() }).ok).toBe(false);
  });

  it('範囲外のノートを理由つきで拒否する', () => {
    const base = validProject();
    base.tracks[0]!.notes.push({ step: TOTAL_STEPS, pitch: 60, length: 1, velocity: 1 });
    const result = validateProject(base);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain('step');
  });

  it('ステップ範囲をはみ出す長さのノートを拒否する', () => {
    const base = validProject();
    base.tracks[0]!.notes.push({ step: TOTAL_STEPS - 2, pitch: 60, length: 4, velocity: 1 });
    expect(validateProject(base).ok).toBe(false);
  });

  it('drums の length !== 1 や範囲外レーンを拒否する', () => {
    const withDrumNote = (note: object) => {
      const base = validProject();
      base.tracks[3]!.notes.push(note as never);
      return base;
    };
    expect(validateProject(withDrumNote({ step: 0, pitch: 0, length: 2, velocity: 1 })).ok).toBe(false);
    expect(validateProject(withDrumNote({ step: 0, pitch: 8, length: 1, velocity: 1 })).ok).toBe(false);
    expect(validateProject(withDrumNote({ step: 0, pitch: 7, length: 1, velocity: 1 })).ok).toBe(true);
  });

  it('正しいプロジェクトは project を返す', () => {
    const base = validProject();
    base.tracks[0]!.notes.push({ step: 0, pitch: 60, length: 4, velocity: 0.8 });
    const result = validateProject(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.project.tracks[0]!.notes).toHaveLength(1);
  });
});
