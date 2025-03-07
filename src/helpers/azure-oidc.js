import jwt from '@hapi/jwt'

import { config } from '~/src/config/config.js'
import { proxyFetch } from '~/src/helpers/proxy.js'
import { scopesForUser } from '~/src/api/scopes/helpers/scopes-for-user.js'

const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: async (server) => {
      await server.register(jwt)

      const oidc = await proxyFetch(
        config.get('oidcWellKnownConfigurationUrl'),
        {}
      )
        .then((response) => response.json())
        .catch((error) => server.logger.error(error))

      server.auth.strategy('azure-oidc', 'jwt', {
        keys: {
          uri: oidc.jwks_uri
        },
        verify: {
          aud: config.get('oidcAudience'),
          iss: oidc.issuer,
          sub: false,
          nbf: true,
          exp: true,
          maxAgeSec: 5400, // 90 minutes
          timeSkewSec: 15
        },
        validate: async (artifacts) => {
          const payload = artifacts.decoded.payload

          const credentials = {
            id: payload.oid,
            displayName: payload.name,
            email: payload.upn ?? payload.preferred_username,
            scope: [...payload.groups, payload.oid]
          }

          const { scopes, scopeFlags } = await scopesForUser(
            credentials,
            server.db
          )

          return {
            isValid: true,
            credentials: {
              id: payload.oid,
              displayName: payload.name,
              email: payload.upn ?? payload.preferred_username,
              scope: scopes,
              scopeFlags
            }
          }
        }
      })
    }
  }
}

export { azureOidc }
