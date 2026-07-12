import { create } from 'zustand';
import {
  clampBpm,
  createInitialProject,
  type ConsoleMode,
  type Note,
  type Project,
  type TrackId,
} from '../model/project';

interface ProjectStore {
  project: Project;
  setTitle: (title: string) => void;
  setBpm: (bpm: number) => void;
  setConsoleMode: (mode: ConsoleMode) => void;
  setTrackVolume: (trackId: TrackId, volume: number) => void;
  toggleMute: (trackId: TrackId) => void;
  toggleSolo: (trackId: TrackId) => void;
  addNote: (trackId: TrackId, note: Note) => void;
  /** step と pitch が一致するノートを削除する */
  removeNote: (trackId: TrackId, step: number, pitch: number) => void;
  /** JSON 読み込みなどでプロジェクト全体を置き換える */
  loadProject: (project: Project) => void;
}

function updateTrack(
  project: Project,
  trackId: TrackId,
  update: (track: Project['tracks'][number]) => Partial<Project['tracks'][number]>,
): Project {
  return {
    ...project,
    tracks: project.tracks.map((track) =>
      track.id === trackId ? { ...track, ...update(track) } : track,
    ),
  };
}

export const useProjectStore = create<ProjectStore>()((set) => ({
  project: createInitialProject(),

  setTitle: (title) => set((s) => ({ project: { ...s.project, title } })),

  setBpm: (bpm) => set((s) => ({ project: { ...s.project, bpm: clampBpm(bpm) } })),

  setConsoleMode: (consoleMode) => set((s) => ({ project: { ...s.project, consoleMode } })),

  setTrackVolume: (trackId, volume) =>
    set((s) => ({
      project: updateTrack(s.project, trackId, () => ({
        volume: Math.min(1, Math.max(0, volume)),
      })),
    })),

  toggleMute: (trackId) =>
    set((s) => ({
      project: updateTrack(s.project, trackId, (t) => ({ mute: !t.mute })),
    })),

  toggleSolo: (trackId) =>
    set((s) => ({
      project: updateTrack(s.project, trackId, (t) => ({ solo: !t.solo })),
    })),

  addNote: (trackId, note) =>
    set((s) => ({
      project: updateTrack(s.project, trackId, (t) => ({ notes: [...t.notes, note] })),
    })),

  removeNote: (trackId, step, pitch) =>
    set((s) => ({
      project: updateTrack(s.project, trackId, (t) => ({
        notes: t.notes.filter((n) => !(n.step === step && n.pitch === pitch)),
      })),
    })),

  loadProject: (project) => set({ project }),
}));
