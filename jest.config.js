export default {
  rootDir: '.',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: false,
  watchPathIgnorePatterns: ['globalConfig'],
  preset: '@shelf/jest-mongodb',
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  setupFiles: ['<rootDir>/.jest/setup-file.js'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup-file-after-env.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.server',
    '<rootDir>/src/__fixtures__',
    '<rootDir>/test-helpers',
    'index.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  // Don't transform ESM only dependencies
  transformIgnorePatterns: [
    '/node_modules(?!/(universal-user-agent|@defra/hapi-tracing))'
  ]
}
