import path from 'path'
import hapi from '@hapi/hapi'
import jwt from '@hapi/jwt'

import { appConfig } from '~/src/config'
import { failAction } from '~/src/helpers/fail-action'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/request-logger'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { msGraphPlugin } from '~/src/helpers/ms-graph'
import { octokitPlugin } from '~/src/helpers/octokit'

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

  await server.register(requestLogger)

  await server.register(jwt)

  await server.register({ plugin: mongoPlugin, options: {} })

  await server.register({ plugin: msGraphPlugin, options: {} })

  await server.register({ plugin: octokitPlugin, options: {} })

  server.auth.strategy('azure-oidc', 'jwt', {
    keys: {
      uri: `https://login.microsoftonline.com/${appConfig.get(
        'azureTenantId'
      )}/discovery/v2.0/keys`
    },
    verify: {
      aud: `${appConfig.get('azureSSOClientId')}`,
      iss: `https://login.microsoftonline.com/${appConfig.get(
        'azureTenantId'
      )}/v2.0`,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 5400, // 90 minutes
      timeSkewSec: 15
    },
    validate: (artifacts, request, h) => {
      const payload = artifacts.decoded.payload
      return {
        isValid: true,
        credentials: {
          id: payload.oid,
          displayName: payload.name,
          email: payload.upn ?? payload.preferred_username,
          scope: [...payload.groups, payload.oid]
        }
      }
    }
  })

  await server.register(router, {
    routes: { prefix: appConfig.get('appPathPrefix') }
  })

  return server
}

export { createServer }
