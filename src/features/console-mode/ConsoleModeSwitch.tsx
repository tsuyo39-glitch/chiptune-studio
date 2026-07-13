import { CONSOLE_MODES, type ConsoleMode } from '../../model/project';
import { useProjectStore } from '../../store/projectStore';

const MODE_LABELS: Record<ConsoleMode, string> = {
  famicom: 'ファミコン',
  superfamicom: 'スーパーファミコン',
  gameboy: 'ゲームボーイ',
};

// 自作のドット絵 SVG アイコン（文字は使わない）

function FamicomIcon() {
  return (
    <svg viewBox="0 0 12 12" width="24" height="24" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      {/* カセット */}
      <rect x="4" y="1" width="4" height="3" />
      {/* 本体 */}
      <rect x="1" y="5" width="10" height="4" />
      {/* コントローラ × 2 */}
      <rect x="1" y="10" width="3" height="2" />
      <rect x="8" y="10" width="3" height="2" />
    </svg>
  );
}

function SuperFamicomIcon() {
  return (
    <svg viewBox="0 0 12 12" width="24" height="24" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      {/* 段つきの本体 */}
      <rect x="3" y="2" width="6" height="2" />
      <rect x="1" y="4" width="10" height="5" />
      {/* 手前の丸ボタン × 2 */}
      <rect x="3" y="10" width="2" height="1" />
      <rect x="7" y="10" width="2" height="1" />
    </svg>
  );
}

function GameBoyIcon() {
  return (
    <svg viewBox="0 0 12 12" width="24" height="24" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      {/* 縦型本体（画面部分をくり抜く） */}
      <rect x="3" y="0" width="6" height="2" />
      <rect x="3" y="2" width="1" height="4" />
      <rect x="8" y="2" width="1" height="4" />
      <rect x="3" y="6" width="6" height="6" />
    </svg>
  );
}

const MODE_ICONS: Record<ConsoleMode, () => React.ReactElement> = {
  famicom: FamicomIcon,
  superfamicom: SuperFamicomIcon,
  gameboy: GameBoyIcon,
};

/** コンソールモード切替（アイコンのみ、選択中はアクセント色） */
export function ConsoleModeSwitch() {
  const consoleMode = useProjectStore((s) => s.project.consoleMode);
  const setConsoleMode = useProjectStore((s) => s.setConsoleMode);

  return (
    <div className="flex gap-2" role="radiogroup" aria-label="コンソールモード">
      {CONSOLE_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode];
        const selected = mode === consoleMode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={MODE_LABELS[mode]}
            title={MODE_LABELS[mode]}
            onClick={() => setConsoleMode(mode)}
            className={`flex h-10 w-10 items-center justify-center border-2 border-ink select-none ${
              selected ? 'bg-accent text-paper shadow-(--shadow-pixel)' : 'bg-paper text-ink'
            } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
