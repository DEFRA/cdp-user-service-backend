import jwt from '@hapi/jwt'

import { config } from '../config/config.js'
import { scopesForUser } from '../api/permissions/helpers/relationships/scopes-for-user.js'

const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: async (server) => {
      await server.register(jwt)

      const response = await fetch(config.get('oidcWellKnownConfigurationUrl'))

      if (!response.ok) {
        const message = `Failed to fetch OIDC config: ${response.status} ${response.statusText}`
        server.logger.error(message)
        throw new Error(message)
      }

      const oidc = await response.json()

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
            server.db,
            credentials.id
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
