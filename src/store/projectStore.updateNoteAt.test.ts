import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialProject } from '../model/project';
import { useProjectStore } from './projectStore';

beforeEach(() => {
  useProjectStore.setState({ project: createInitialProject() });
});

describe('updateNoteAt', () => {
  it('指定インデックスのノートだけ部分更新する', () => {
    const s = useProjectStore.getState();
    s.addNote('piano', { step: 0, pitch: 60, length: 1, velocity: 0.8 });
    s.addNote('piano', { step: 4, pitch: 64, length: 1, velocity: 0.8 });
    useProjectStore.getState().updateNoteAt('piano', 1, { step: 8, length: 4 });
    const notes = useProjectStore.getState().project.tracks[0]!.notes;
    expect(notes[0]).toEqual({ step: 0, pitch: 60, length: 1, velocity: 0.8 });
    expect(notes[1]).toEqual({ step: 8, pitch: 64, length: 4, velocity: 0.8 });
  });

  it('範囲外インデックスは何もしない', () => {
    useProjectStore.getState().updateNoteAt('piano', 5, { step: 1 });
    expect(useProjectStore.getState().project.tracks[0]!.notes).toEqual([]);
  });
});
