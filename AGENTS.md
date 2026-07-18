# chiptune-studio（仮称）

8bit 音楽制作 Web アプリ。仕様は [SPECIFICATION.md](SPECIFICATION.md) を厳守すること（スコープ・非目標を含む）。

## コマンド

- `npm run dev` — 開発サーバ
- `npm run typecheck` — 型チェック（tsc -b）
- `npm run lint` — oxlint
- `npm run build` — 本番ビルド

## アーキテクチャの要点

- `src/audio/` と `src/model/` は React / Zustand に依存しない純粋 TS
- 依存方向は UI → store → model / audio の一方向のみ
- サウンドは Web Audio API 素の API のみ（Tone.js 等は使わない）
- 再生とエクスポートは同じエンジンコード（AudioContext を引数で受け取る）

## 開発の進め方

- 1 セッション = 1 スライス = 1 ブランチ（SPECIFICATION.md §9 の実装順）
- 完了条件: typecheck / lint / build 通過 + 実ブラウザでの動作確認（音は耳で確認）

## スタイル

- ドット調テーマの変数は `src/styles/theme.css` に集約（ファミコン風クリーム/レッド/ブラック + コンソール別アクセント）
- 角丸・グラデーション・ぼかし禁止。影は 4px オフセットのベタ塗り
- フォントはセルフホスト（`public/fonts/`、DotGothic16 / Press Start 2P）
