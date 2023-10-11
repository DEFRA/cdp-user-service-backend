import hapiPino from 'hapi-pino'
import ecsFormat from '@elastic/ecs-pino-format'

import { appConfig } from '~/src/config'

const requestLogger = {
  plugin: hapiPino,
  options: {
    enabled: !appConfig.get('isTest'),
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
      remove: true
    },
    level: appConfig.get('logLevel'),
    ...(appConfig.get('isDevelopment')
      ? { transport: { target: 'pino-pretty' } }
      : ecsFormat())
  }
}

export { requestLogger }
