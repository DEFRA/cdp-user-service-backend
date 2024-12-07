import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config/index.js'
import { failAction } from '~/src/helpers/fail-action.js'
import { router } from '~/src/api/router.js'
import { requestLogger } from '~/src/helpers/logging/request-logger.js'
import { mongoPlugin } from '~/src/helpers/mongodb.js'
import { msGraphPlugin } from '~/src/helpers/ms-graph.js'
import { octokitPlugin } from '~/src/helpers/octokit.js'
import { azureOidc } from '~/src/helpers/azure-oidc.js'
import { secureContext } from '~/src/helpers/secure-context/index.js'
import { setupWreckAgents } from '~/src/helpers/setup-wreck-agents.js'
import { provideProxy } from '~/src/helpers/proxy.js'
import { pulse } from '~/src/helpers/pulse.js'
import { tracing } from '~/src/helpers/tracing/tracing.js'

const isProduction = config.get('isProduction')

async function createServer() {
  setupWreckAgents(provideProxy())

  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
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
  await server.register([tracing, requestLogger])

  if (enableSecureContext) {
    await server.register(secureContext)
  }

  await server.register([
    pulse,
    azureOidc,
    mongoPlugin,
    msGraphPlugin,
    octokitPlugin,
    router
  ])

  return server
}

export { createServer }
