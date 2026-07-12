import { useEffect } from 'react';
import { getAudioOutput } from './audio/output';
import { previewNote } from './audio/preview';
import { PixelButton } from './components/PixelButton';
import { DrumGrid } from './features/drum-grid/DrumGrid';
import { Transport } from './features/transport/Transport';
import type { TrackId } from './model/project';
import { useProjectStore } from './store/projectStore';

function preview(trackId: TrackId, pitch: number): void {
  const { ctx, master } = getAudioOutput();
  previewNote(ctx, master, trackId, pitch);
}

// トラックタブ（スライス 7）までの仮画面。ドラム以外の楽器は試聴ボタンで確認する。
function App() {
  const project = useProjectStore((s) => s.project);

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

      <main className="space-y-8 p-4">
        <section className="space-y-2">
          <h2 className="text-lg">ドラム</h2>
          <DrumGrid />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg">試聴（famicom）</h2>
          <div className="flex flex-wrap items-center gap-4">
            <PixelButton onClick={() => preview('piano', 60)}>ピアノ C4</PixelButton>
            <PixelButton onClick={() => preview('guitar', 64)}>ギター E4</PixelButton>
            <PixelButton onClick={() => preview('bass', 36)}>ベース C2</PixelButton>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
