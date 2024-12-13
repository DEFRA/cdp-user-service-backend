import path from 'path'
import hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'

import { azureOidc } from '~/src/helpers/azure-oidc.js'
import { config } from '~/src/config/config.js'
import { failAction } from '~/src/helpers/fail-action.js'
import { mongoPlugin } from '~/src/helpers/mongodb.js'
import { msGraphPlugin } from '~/src/helpers/ms-graph.js'
import { octokitPlugin } from '~/src/helpers/octokit.js'
import { provideProxy } from '~/src/helpers/proxy.js'
import { pulse } from '~/src/helpers/pulse.js'
import { requestLogger } from '~/src/helpers/logging/request-logger.js'
import { router } from '~/src/api/router.js'
import { secureContext } from '~/src/helpers/secure-context/index.js'
import { setupWreckAgents } from '~/src/helpers/setup-wreck-agents.js'
import { swaggerOptions } from '~/src/helpers/docs/swagger-options.js'
import { requestTracing } from '~/src/helpers/request-tracing.js'

const root = config.get('root')
const port = config.get('port')
const enableSecureContext = config.get('enableSecureContext')
const enableDocumentation = config.get('enableDocumentation')

async function createServer() {
  setupWreckAgents(provideProxy())

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
    mongoPlugin,
    msGraphPlugin,
    octokitPlugin,
    router
  ])

  if (enableDocumentation) {
    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: swaggerOptions
      }
    ])
  }

  return server
}

export { createServer }
