import { useEffect, useState } from 'react';
import { PixelButton } from './components/PixelButton';
import { DrumGrid } from './features/drum-grid/DrumGrid';
import { PianoRoll, type PitchedTrackId } from './features/piano-roll/PianoRoll';
import { Transport } from './features/transport/Transport';
import type { TrackId } from './model/project';
import { useProjectStore } from './store/projectStore';

const TRACK_LABELS: Record<TrackId, string> = {
  piano: 'ピアノ',
  guitar: 'ギター',
  bass: 'ベース',
  drums: 'ドラム',
};

// トラックタブ（音量 / M / S はスライス 7 で追加する）
function App() {
  const project = useProjectStore((s) => s.project);
  const [activeTrack, setActiveTrack] = useState<TrackId>('drums');

  useEffect(() => {
    document.documentElement.dataset.console = project.consoleMode;
  }, [project.consoleMode]);

  return (
    <div className="min-h-dvh">
      <header className="flex items-center gap-4 border-b-2 border-ink px-4 py-3">
        <h1 className="text-2xl tracking-widest">CHIPTUNE STUDIO</h1>
        <span className="text-shade">{project.title}</span>
      </header>

      <Transport />

      <main className="space-y-4 p-4">
        <div className="flex gap-2">
          {(Object.keys(TRACK_LABELS) as TrackId[]).map((trackId) => (
            <PixelButton
              key={trackId}
              variant={trackId === activeTrack ? 'accent' : 'normal'}
              onClick={() => setActiveTrack(trackId)}
            >
              {TRACK_LABELS[trackId]}
            </PixelButton>
          ))}
        </div>

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
