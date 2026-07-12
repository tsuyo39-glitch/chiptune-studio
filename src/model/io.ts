// プロジェクトの JSON 入出力と localStorage 永続化（UI 非依存）。

import { validateProject, type Project, type ValidationResult } from './project';

export const STORAGE_KEY = 'chiptune-studio:project';

export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/** JSON 文字列を検証つきで Project に変換する */
export function parseProject(json: string): ValidationResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, errors: ['JSON として解析できませんでした'] };
  }
  return validateProject(data);
}

export function saveToStorage(storage: Storage, project: Project): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(project));
}

/** 保存がない・壊れている場合は null（呼び出し側が初期プロジェクトで開始する） */
export function loadFromStorage(storage: Storage): Project | null {
  const json = storage.getItem(STORAGE_KEY);
  if (json === null) return null;
  const result = parseProject(json);
  return result.ok ? result.project : null;
}
