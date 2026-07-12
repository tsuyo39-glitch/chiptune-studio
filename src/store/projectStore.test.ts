import { beforeEach, describe, expect, it } from 'vitest';
import { BPM_MAX, createInitialProject } from '../model/project';
import { useProjectStore } from './projectStore';

// ストアはモジュールシングルトンなので各テストで初期状態に戻す
beforeEach(() => {
  useProjectStore.setState({ project: createInitialProject() });
});

describe('projectStore', () => {
  it('setBpm は範囲外をクランプする', () => {
    useProjectStore.getState().setBpm(9999);
    expect(useProjectStore.getState().project.bpm).toBe(BPM_MAX);
  });

  it('setTitle でタイトルが変わる', () => {
    useProjectStore.getState().setTitle('my song');
    expect(useProjectStore.getState().project.title).toBe('my song');
  });

  it('setConsoleMode でモードが変わる', () => {
    useProjectStore.getState().setConsoleMode('gameboy');
    expect(useProjectStore.getState().project.consoleMode).toBe('gameboy');
  });

  it('setTrackVolume は 0–1 にクランプする', () => {
    useProjectStore.getState().setTrackVolume('piano', 1.5);
    expect(useProjectStore.getState().project.tracks[0]!.volume).toBe(1);
    useProjectStore.getState().setTrackVolume('piano', -1);
    expect(useProjectStore.getState().project.tracks[0]!.volume).toBe(0);
  });

  it('toggleMute / toggleSolo は対象トラックだけ反転する', () => {
    useProjectStore.getState().toggleMute('bass');
    useProjectStore.getState().toggleSolo('bass');
    const { tracks } = useProjectStore.getState().project;
    expect(tracks[2]).toMatchObject({ id: 'bass', mute: true, solo: true });
    expect(tracks[0]).toMatchObject({ mute: false, solo: false });
    useProjectStore.getState().toggleMute('bass');
    expect(useProjectStore.getState().project.tracks[2]!.mute).toBe(false);
  });

  it('addNote / removeNote', () => {
    const note = { step: 4, pitch: 60, length: 2, velocity: 0.8 };
    useProjectStore.getState().addNote('piano', note);
    expect(useProjectStore.getState().project.tracks[0]!.notes).toEqual([note]);
    useProjectStore.getState().removeNote('piano', 4, 60);
    expect(useProjectStore.getState().project.tracks[0]!.notes).toEqual([]);
  });

  it('更新は元のオブジェクトを変異させない（イミュータブル）', () => {
    const before = useProjectStore.getState().project;
    useProjectStore.getState().addNote('piano', { step: 0, pitch: 60, length: 1, velocity: 1 });
    expect(before.tracks[0]!.notes).toHaveLength(0);
  });

  it('loadProject で全体を置き換える', () => {
    const project = { ...createInitialProject(), title: 'loaded', bpm: 90 };
    useProjectStore.getState().loadProject(project);
    expect(useProjectStore.getState().project).toEqual(project);
  });
});
