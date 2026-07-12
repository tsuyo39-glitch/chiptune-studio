import { loadFromStorage, saveToStorage } from '../model/io';
import { useProjectStore } from './projectStore';

const DEBOUNCE_MS = 1000;

/** 起動時に localStorage から前回のプロジェクトを復元する */
export function restoreProject(storage: Storage): void {
  const saved = loadFromStorage(storage);
  if (saved) {
    useProjectStore.getState().loadProject(saved);
  }
}

/** プロジェクト変更を debounce 1 秒で localStorage に自動保存する */
export function startAutosave(storage: Storage): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = useProjectStore.subscribe((state, prevState) => {
    if (state.project === prevState.project) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      saveToStorage(storage, useProjectStore.getState().project);
    }, DEBOUNCE_MS);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
