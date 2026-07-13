import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // 更新は自動リロードせずトーストで確認（§7）
      includeAssets: ['favicon.svg', 'fonts/**/*.woff2'],
      manifest: {
        name: 'chiptune-studio',
        short_name: 'chiptune',
        description: '8bit チップチューン音楽制作アプリ',
        lang: 'ja',
        display: 'standalone',
        background_color: '#f2e8d3',
        theme_color: '#f2e8d3',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // フォントの woff2 を含む全アセットをプリキャッシュしてオフライン動作させる
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
})
