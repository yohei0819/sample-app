import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vitest 設定
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // 追加: Playwright E2E テストは Vitest の対象外（Playwright Runner で実行）
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 追加: server-only はテスト環境ではダミー化（Server Component 限定の制約をバイパス）
      'server-only': path.resolve(__dirname, './src/test/server-only-shim.ts'),
    },
  },
})
