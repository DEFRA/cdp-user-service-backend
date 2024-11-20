import { ecsFormat } from '@elastic/ecs-pino-format'

import { getTraceId } from '~/src/helpers/tracing/async-local-storage.js'
import { config } from '~/src/config/index.js'

const logConfig = config.get('log')
const serviceConfig = config.get('service')

/**
 * @type {{ecs: Omit<LoggerOptions, "mixin"|"transport">, "pino-pretty": {transport: {target: string}}}}
 */
const formatters = {
  ecs: {
    ...ecsFormat(),
    base: {
      service: {
        name: serviceConfig.name,
        type: 'nodeJs',
        version: serviceConfig.version,
        environment: serviceConfig.environment
      }
    }
  },
  'pino-pretty': { transport: { target: 'pino-pretty' } }
}

/**
 * @satisfies {Options}
 */
export const loggerOptions = {
  enabled: logConfig.enabled,
  ignorePaths: ['/health'],
  redact: {
    paths: logConfig.redact,
    remove: true
  },
  level: logConfig.level,
  ...formatters[logConfig.format],
  mixin() {
    const mixinValues = {}
    const traceId = getTraceId()

    if (traceId) {
      mixinValues.trace = { id: traceId }
    }

    return mixinValues
  }
}

/**
 * @import { Options } from 'hapi-pino'
 * @import { LoggerOptions } from 'pino'
 */
