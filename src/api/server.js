import path from 'path'
import hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'

import { azureOidc } from '../helpers/azure-oidc.js'
import { config } from '../config/config.js'
import { failAction } from '../helpers/fail-action.js'
import { mongoDb } from '../helpers/mongodb.js'
import { msGraphPlugin } from '../helpers/ms-graph.js'
import { octokitPlugin } from '../helpers/octokit.js'
import { pulse } from '../helpers/pulse.js'
import { requestLogger } from '../helpers/logging/request-logger.js'
import { router } from './router.js'
import { secureContext } from '@defra/hapi-secure-context'
import { requestTracing } from '../helpers/request-tracing.js'
import { metrics } from '@defra/cdp-metrics'
import { metricsScheduler } from '../helpers/metrics/metrics-scheduler.js'

async function createServer(configOverrides = {}) {
  config.load(configOverrides)

  const root = config.get('root')
  const port = config.get('port')
  const enableDocumentation = config.get('enableDocumentation')

  const server = hapi.server({
    port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(root, '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register([
    requestLogger,
    requestTracing,
    secureContext,
    pulse,
    azureOidc,
    { plugin: mongoDb.plugin, options: config.get('mongo') },
    msGraphPlugin,
    octokitPlugin,
    metrics,
    { plugin: metricsScheduler.plugin, options: config.get('metrics') },
    router
  ])

  if (enableDocumentation) {
    await server.register([Inert, Vision])
  }

  return server
}

export { createServer }
