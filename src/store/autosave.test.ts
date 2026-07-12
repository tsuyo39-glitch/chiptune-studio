import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../model/io';
import { createInitialProject } from '../model/project';
import { restoreProject, startAutosave } from './autosave';
import { useProjectStore } from './projectStore';

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

beforeEach(() => {
  vi.useFakeTimers();
  useProjectStore.setState({ project: createInitialProject() });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('startAutosave', () => {
  it('変更から 1 秒後に保存される（debounce）', () => {
    const storage = memoryStorage();
    const stop = startAutosave(storage);

    useProjectStore.getState().setBpm(100);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();

    useProjectStore.getState().setBpm(110); // 連続変更はまとめられる
    vi.advanceTimersByTime(1000);

    const saved = storage.getItem(STORAGE_KEY);
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved!).bpm).toBe(110);
    stop();
  });

  it('停止後は保存されない', () => {
    const storage = memoryStorage();
    const stop = startAutosave(storage);
    stop();
    useProjectStore.getState().setBpm(100);
    vi.advanceTimersByTime(2000);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('restoreProject', () => {
  it('保存済みプロジェクトを復元する', () => {
    const storage = memoryStorage();
    const project = { ...createInitialProject(), title: 'restored' };
    storage.setItem(STORAGE_KEY, JSON.stringify(project));
    restoreProject(storage);
    expect(useProjectStore.getState().project).toEqual(project);
  });

  it('保存がなければ現在の状態を維持する', () => {
    restoreProject(memoryStorage());
    expect(useProjectStore.getState().project.title).toBe('untitled');
  });
});
