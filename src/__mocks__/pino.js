import originalPino from 'pino'

// Mock logger
const mockPino = {
  levels: {
    labels: {
      10: 'trace',
      20: 'debug',
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal'
    },
    values: {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60
    }
  },
  fatal: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  silent: jest.fn()
}
mockPino.child = () => mockPino

const mockPinoFunc = () => mockPino
mockPinoFunc.stdSerializers = originalPino.stdSerializers

jest.doMock('pino', () => mockPinoFunc)

module.exports = require('pino')
