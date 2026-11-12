/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 相對路徑：部署在 GitHub Pages 的子路徑（/network-world-map/）也能載入資源；路由用 hash，不需要 404 fallback
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
