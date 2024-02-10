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

const isProduction = config.get('isProduction')

async function createServer() {
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

  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register(azureOidc)

  await server.register({ plugin: mongoPlugin, options: {} })

  await server.register({ plugin: msGraphPlugin, options: {} })

  await server.register({ plugin: octokitPlugin, options: {} })

  await server.register(router, {
    routes: { prefix: config.get('appPathPrefix') }
  })

  return server
}

export { createServer }
