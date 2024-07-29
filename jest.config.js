module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: process.env.NODE_ENV !== 'development',
  preset: '@shelf/jest-mongodb',
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.server',
    '<rootDir>/src/__fixtures__'
  ],
  coverageDirectory: '<rootDir>/coverage'
}
