import { useEffect, useState } from 'react';
import { ConsoleModeSwitch } from './features/console-mode/ConsoleModeSwitch';
import { DrumGrid } from './features/drum-grid/DrumGrid';
import { ProjectFileButtons } from './features/export/ProjectFileButtons';
import { WavExportButton } from './features/export/WavExportButton';
import { PianoRoll, type PitchedTrackId } from './features/piano-roll/PianoRoll';
import { UpdateToast } from './features/pwa/UpdateToast';
import { TrackTabs } from './features/tracks/TrackTabs';
import { Transport } from './features/transport/Transport';
import { useTransport } from './features/transport/useTransport';
import { TRACK_IDS, type TrackId } from './model/project';
import { useProjectStore } from './store/projectStore';

function isEditingText(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  );
}

function App() {
  const project = useProjectStore((s) => s.project);
  const setTitle = useProjectStore((s) => s.setTitle);
  const [activeTrack, setActiveTrack] = useState<TrackId>('drums');
  const { toggle: togglePlayback } = useTransport();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || isEditingText(event.target)) {
        return;
      }

      const trackIndex = Number(event.key) - 1;
      const selectedTrack = TRACK_IDS[trackIndex];
      if (selectedTrack) {
        event.preventDefault();
        setActiveTrack(selectedTrack);
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayback();
      } else if (event.code === 'KeyM') {
        event.preventDefault();
        useProjectStore.getState().toggleMute(activeTrack);
      } else if (event.code === 'KeyS') {
        event.preventDefault();
        useProjectStore.getState().toggleSolo(activeTrack);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTrack, togglePlayback]);

  useEffect(() => {
    document.documentElement.dataset.console = project.consoleMode;
  }, [project.consoleMode]);

  return (
    <div className="min-h-dvh">
      <header className="flex flex-wrap items-center gap-4 border-b-2 border-ink px-4 py-3">
        <h1 className="text-2xl tracking-widest">CHIPTUNE STUDIO</h1>
        <input
          type="text"
          value={project.title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="プロジェクト名"
          className="w-48 border-2 border-ink bg-paper px-2 py-1 text-sm text-shade focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
        <div className="ml-auto flex items-center gap-6">
          <ConsoleModeSwitch />
          <div className="flex gap-2">
            <ProjectFileButtons />
            <WavExportButton />
          </div>
        </div>
      </header>

      <Transport onToggle={togglePlayback} />

      <main className="space-y-4 p-4">
        <TrackTabs activeTrack={activeTrack} onSelect={setActiveTrack} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-y-2 border-ink bg-tone px-3 py-2 text-xs text-shade" aria-label="キーボードショートカット">
          <span><kbd className="font-num text-[9px] text-ink">SPACE</kbd> 再生/停止</span>
          <span><kbd className="font-num text-[9px] text-ink">1–4</kbd> トラック切替</span>
          <span><kbd className="font-num text-[9px] text-ink">M</kbd> ミュート</span>
          <span><kbd className="font-num text-[9px] text-ink">S</kbd> ソロ</span>
        </div>

        {activeTrack === 'drums' ? (
          <DrumGrid />
        ) : (
          <PianoRoll trackId={activeTrack as PitchedTrackId} />
        )}
      </main>

      <UpdateToast />
    </div>
  );
}

export default App;
