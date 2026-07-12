import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, loadFromStorage, parseProject, saveToStorage, serializeProject } from './io';
import { createInitialProject } from './project';

/** テスト用の最小 Storage 実装 */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
  };
}

describe('serializeProject / parseProject', () => {
  it('ラウンドトリップで同じプロジェクトに戻る', () => {
    const project = createInitialProject();
    project.tracks[0]!.notes.push({ step: 0, pitch: 60, length: 2, velocity: 0.8 });
    const result = parseProject(serializeProject(project));
    expect(result).toEqual({ ok: true, project });
  });

  it('壊れた JSON は理由つきで拒否する', () => {
    const result = parseProject('{not json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain('JSON');
  });

  it('スキーマ不正は validateProject の理由を返す', () => {
    const result = parseProject('{"version": 2}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join()).toContain('version');
  });
});

describe('saveToStorage / loadFromStorage', () => {
  it('保存して復元できる', () => {
    const storage = memoryStorage();
    const project = { ...createInitialProject(), title: 'saved song', bpm: 90 };
    saveToStorage(storage, project);
    expect(loadFromStorage(storage)).toEqual(project);
  });

  it('保存がなければ null', () => {
    expect(loadFromStorage(memoryStorage())).toBeNull();
  });

  it('壊れたデータは null（初期プロジェクトで開始できる）', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{broken');
    expect(loadFromStorage(storage)).toBeNull();
  });
});
