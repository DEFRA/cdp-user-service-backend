import jwt from '@hapi/jwt'

import { config } from '~/src/config'
import { proxyFetch } from '~/src/helpers/proxy'

const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: async (server) => {
      await server.register(jwt)

      const oidc = await proxyFetch(
        config.get('oidcWellKnownConfigurationUrl')
      ).then((response) => response.json())

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
    }
  }
}

export { azureOidc }
