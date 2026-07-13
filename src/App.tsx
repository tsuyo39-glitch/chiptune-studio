import { useEffect, useState } from 'react';
import { ConsoleModeSwitch } from './features/console-mode/ConsoleModeSwitch';
import { DrumGrid } from './features/drum-grid/DrumGrid';
import { ProjectFileButtons } from './features/export/ProjectFileButtons';
import { WavExportButton } from './features/export/WavExportButton';
import { PianoRoll, type PitchedTrackId } from './features/piano-roll/PianoRoll';
import { TrackTabs } from './features/tracks/TrackTabs';
import { Transport } from './features/transport/Transport';
import type { TrackId } from './model/project';
import { useProjectStore } from './store/projectStore';

function App() {
  const project = useProjectStore((s) => s.project);
  const setTitle = useProjectStore((s) => s.setTitle);
  const [activeTrack, setActiveTrack] = useState<TrackId>('drums');

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

      <Transport />

      <main className="space-y-4 p-4">
        <TrackTabs activeTrack={activeTrack} onSelect={setActiveTrack} />

        {activeTrack === 'drums' ? (
          <DrumGrid />
        ) : (
          <PianoRoll trackId={activeTrack as PitchedTrackId} />
        )}
      </main>
    </div>
  );
}

export default App;
