import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config'
import { failAction } from '~/src/helpers/fail-action'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { msGraphPlugin } from '~/src/helpers/ms-graph'
import { octokitPlugin } from '~/src/helpers/octokit'
import { azureOidc } from '~/src/helpers/azure-oidc'
import { secureContext } from '~/src/helpers/secure-context'
import { setupWreckAgents } from '~/src/helpers/setup-wreck-agents'
import { provideProxy } from '~/src/helpers/proxy'
import { pulse } from '~/src/helpers/pulse'

const isProduction = config.isProduction

async function createServer() {
  setupWreckAgents(provideProxy())

  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(config.root, '.public')
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

  await server.register(requestLogger)

  if (isProduction) {
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
