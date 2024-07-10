import hapiPulse from 'hapi-pulse'
import { createLogger } from '~/src/helpers/logging/logger'

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
