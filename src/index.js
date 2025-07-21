import process from 'node:process'
import { createLogger } from './helpers/logging/logger.js'
import { startServer } from './helpers/start-server.js'

await startServer()

process.on('unhandledRejection', (error) => {
  const logger = createLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
