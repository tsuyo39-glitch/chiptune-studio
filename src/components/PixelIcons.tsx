// 自作のドット絵 SVG アイコン（外部アイコンライブラリは使わない・SPECIFICATION.md §5.3）。
// viewBox 12x12・crispEdges・currentColor で色はテーマに追従する。

type IconProps = { size?: number };

function PixelSvg({ size = 20, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 再生（右向き三角をドットの階段で表現） */
export function PlayIcon({ size }: IconProps) {
  return (
    <PixelSvg size={size}>
      <rect x="3" y="2" width="1" height="8" />
      <rect x="4" y="3" width="1" height="6" />
      <rect x="5" y="4" width="1" height="4" />
      <rect x="6" y="5" width="1" height="2" />
    </PixelSvg>
  );
}

/** 停止（正方形） */
export function StopIcon({ size }: IconProps) {
  return (
    <PixelSvg size={size}>
      <rect x="3" y="3" width="6" height="6" />
    </PixelSvg>
  );
}

/** メトロノーム（台形の振り子時計） */
export function MetronomeIcon({ size }: IconProps) {
  return (
    <PixelSvg size={size}>
      {/* 本体の輪郭（台形） */}
      <rect x="5" y="1" width="2" height="1" />
      <rect x="4" y="2" width="1" height="8" />
      <rect x="7" y="2" width="1" height="8" />
      <rect x="3" y="10" width="6" height="1" />
      {/* 振り子の芯 */}
      <rect x="6" y="3" width="1" height="5" />
      {/* おもり */}
      <rect x="5" y="5" width="1" height="1" />
    </PixelSvg>
  );
}
