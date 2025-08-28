import path from 'path'
import hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'

import { azureOidc } from '../helpers/azure-oidc.js'
import { config } from '../config/config.js'
import { failAction } from '../helpers/fail-action.js'
import { mongoPlugin } from '../helpers/mongodb.js'
import { msGraphPlugin } from '../helpers/ms-graph.js'
import { octokitPlugin } from '../helpers/octokit.js'
import { setupProxy } from '../helpers/proxy.js'
import { pulse } from '../helpers/pulse.js'
import { requestLogger } from '../helpers/logging/request-logger.js'
import { router } from './router.js'
import { secureContext } from '../helpers/secure-context/index.js'
import { requestTracing } from '../helpers/request-tracing.js'

async function createServer(configOverrides = {}) {
  config.load(configOverrides)

  const root = config.get('root')
  const port = config.get('port')
  const enableSecureContext = config.get('enableSecureContext')
  const enableDocumentation = config.get('enableDocumentation')

  setupProxy()

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

  // Add tracer and request logger before all other plugins
  await server.register([requestTracing, requestLogger])

  if (enableSecureContext) {
    await server.register(secureContext)
  }

  await server.register([
    pulse,
    azureOidc,
    {
      plugin: mongoPlugin,
      options: config.get('mongo')
    },
    msGraphPlugin,
    octokitPlugin,
    router
  ])

  if (enableDocumentation) {
    await server.register([Inert, Vision])
  }

  return server
}

export { createServer }
