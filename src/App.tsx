import { useEffect, useState } from 'react';
import { DRUM_LANE_NAMES } from './audio/instruments/drums';
import { getAudioOutput } from './audio/output';
import { previewNote } from './audio/preview';
import { PixelButton } from './components/PixelButton';
import { PixelSlider } from './components/PixelSlider';
import type { TrackId } from './model/project';
import { useProjectStore } from './store/projectStore';

function preview(trackId: TrackId, pitch: number): void {
  const { ctx, master } = getAudioOutput();
  previewNote(ctx, master, trackId, pitch);
}

// スライス 2 時点の仮画面。以降のスライスでヘッダー・トランスポート・
// シーケンサーに置き換えていく（SPECIFICATION.md §5.1）。
function App() {
  const [volume, setVolume] = useState(80);
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

      <main className="max-w-3xl space-y-10 p-6">
        <section className="space-y-4">
          <h2 className="text-lg">試聴（famicom）</h2>
          <div className="flex flex-wrap items-center gap-4">
            <PixelButton onClick={() => preview('piano', 60)}>ピアノ C4</PixelButton>
            <PixelButton onClick={() => preview('guitar', 64)}>ギター E4</PixelButton>
            <PixelButton onClick={() => preview('bass', 36)}>ベース C2</PixelButton>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {DRUM_LANE_NAMES.map((name, lane) => (
              <PixelButton key={name} onClick={() => preview('drums', lane)}>
                {name}
              </PixelButton>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg">PixelButton</h2>
          <div className="flex flex-wrap items-center gap-4">
            <PixelButton>ボタン</PixelButton>
            <PixelButton variant="accent">アクセント</PixelButton>
            <PixelButton disabled>無効</PixelButton>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg">PixelSlider</h2>
          <div className="flex items-center gap-4">
            <PixelSlider
              value={volume}
              min={0}
              max={100}
              onChange={setVolume}
              aria-label="音量"
              className="w-64"
            />
            <span className="font-num text-xs">{volume}</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
