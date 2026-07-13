# chiptune-studio

ブラウザで動く 8bit（チップチューン）音楽制作アプリ。ファミコン風の音を Web Audio API で再現し、8 小節のループをステップシーケンサーで打ち込んで WAV として書き出せます。

## 機能

- **4 トラック構成** — ピアノ（矩形波 50%）/ ギター（矩形波 25% + ビブラート）/ ベース（三角波）/ ドラム
- **ドラム 8 レーン** — Kick / Snare / HH Close / HH Open / Tom / Clap / Crash / Cowbell
- **ピアノロール** — クリックで追加、ドラッグで移動・長さ変更、クリックで削除。追加時にプレビュー発音
- **ドラムグリッド** — クリックでトグル、ドラッグで連続入力
- **トランスポート** — 再生/停止（スペースキー）・BPM 40–240・メトロノーム・プレイヘッド自動追従
- **ミキシング** — トラックごとの音量・ミュート・ソロ
- **自動保存** — 変更のたびに localStorage へ保存し、次回起動時に復元
- **ファイル入出力** — プロジェクトを `.json` で保存/読込、`.wav`（44.1kHz / 16bit / ステレオ）で書き出し

## 技術スタック

- React 18 + TypeScript (strict) + Vite
- Tailwind CSS v4（ファミコン風カラーのドット調テーマ）
- Zustand（状態管理）
- Web Audio API 素の API のみ（Tone.js 等のラッパー不使用）。再生とエクスポートは同一のエンジンコードを `AudioContext` / `OfflineAudioContext` で共用

詳細な仕様は [SPECIFICATION.md](SPECIFICATION.md) を参照してください。

## 開発

```sh
npm install
npm run dev        # 開発サーバ (http://localhost:5173)
npm run test       # ユニットテスト (Vitest)
npm run typecheck  # 型チェック (tsc -b)
npm run lint       # oxlint
npm run build      # 本番ビルド
```

## ディレクトリ構成

```
src/
├─ audio/        # サウンドエンジン（React 非依存の純粋 TS）
│  ├─ instruments/  # 楽器ごとの発音
│  ├─ scheduler.ts  # lookahead スケジューラ
│  ├─ render.ts     # OfflineAudioContext レンダリング
│  └─ wav.ts        # 16bit PCM WAV エンコーダ
├─ model/        # Project 型・バリデーション・入出力（UI 非依存）
├─ store/        # Zustand ストア・自動保存
├─ features/     # transport / piano-roll / drum-grid / tracks / export
└─ components/   # 共有 UI（PixelButton, PixelSlider, Playhead）
```

依存方向は UI → store → model / audio の一方向のみです。
