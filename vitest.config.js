import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname)
    }
  },
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    coverage: {
      reporter: ['text', 'clover']
    },
    setupFiles: ['.vite/mongo-memory-server.js', '.vite/setup-files.js']
  }
})
