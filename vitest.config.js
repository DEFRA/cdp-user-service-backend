import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: __dirname,
    environment: 'node',
    globals: true,
    clearMocks: true,
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [...configDefaults.exclude, 'src/__fixtures__/**']
    },
    setupFiles: ['.vite/mongo-memory-server.js', '.vite/setup-files.js']
  }
})
