import { useState } from 'react';
import { PixelButton } from './components/PixelButton';
import { PixelSlider } from './components/PixelSlider';

// スライス 1 の仮画面。以降のスライスでヘッダー・トランスポート・
// シーケンサーに置き換えていく（SPECIFICATION.md §5.1）。
function App() {
  const [volume, setVolume] = useState(80);

  return (
    <div className="min-h-dvh">
      <header className="flex items-center gap-4 border-b-2 border-ink px-4 py-3">
        <h1 className="text-2xl tracking-widest">CHIPTUNE STUDIO</h1>
      </header>

      <main className="max-w-3xl space-y-10 p-6">
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
