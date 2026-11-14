/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 相對路徑：部署在 GitHub Pages 的子路徑（/cs-network-roadmap/）也能載入資源；路由用 hash，不需要 404 fallback
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // 世界地圖的測試會渲染全部知識點，CI 機器較慢時可能超過預設的 5 秒
    testTimeout: 15000,
  },
})
