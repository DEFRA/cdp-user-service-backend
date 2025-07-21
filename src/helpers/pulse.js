import hapiPulse from 'hapi-pulse'
import { createLogger } from './logging/logger.js'

const tenSeconds = 10 * 1000

const logger = createLogger()
const pulse = {
  plugin: hapiPulse,
  options: {
    logger,
    timeout: tenSeconds
  }
}

export { pulse }
