import path from 'path'
import hapi from '@hapi/hapi'

import { appConfig } from '~/src/config'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/request-logger'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { msGraphPlugin } from '~/src/helpers/ms-graph'
import { failAction } from '~/src/helpers/fail-action'
import { catchAll } from '~/src/helpers/errors'

async function createServer() {
  const server = hapi.server({
    port: appConfig.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(appConfig.get('root'), '.public')
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register({ plugin: mongoPlugin, options: {} })

  await server.register({ plugin: msGraphPlugin, options: {} })

  await server.register(requestLogger)

  await server.register(router, {
    routes: { prefix: appConfig.get('appPathPrefix') }
  })

  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
