import { createRemoteJWKSet, jwtVerify } from 'jose'

import { config } from '../config/config.js'
import { scopesForUser } from '../api/permissions/helpers/relationships/scopes-for-user.js'
import Boom from '@hapi/boom'

export const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: async (server) => {
      const response = await fetch(config.get('oidcWellKnownConfigurationUrl'))

      if (!response.ok) {
        const message = `Failed to fetch OIDC config: ${response.status} ${response.statusText}`
        server.logger.error(message)
        throw new Error(message)
      }
      const oidc = await response.json()

      const JWKS = createRemoteJWKSet(new URL(oidc.jwks_uri))

      server.auth.scheme('azure-oidc-scheme', () => {
        return {
          authenticate: async (request, h) => {
            const auth = request.headers.authorization

            if (!auth || !auth.startsWith('Bearer ')) {
              throw Boom.unauthorized('Missing token')
            }

            const token = auth.replace('Bearer ', '')

            try {
              const { payload } = await jwtVerify(token, JWKS, {
                issuer: oidc.issuer,
                audience: config.get('oidcAudience'),
                maxTokenAge: '90m',
                clockTolerance: 15
              })

              const { scopes, scopeFlags } = await scopesForUser(
                server.db,
                payload.oid
              )

              return h.authenticated({
                isValid: true,
                credentials: {
                  id: payload.oid,
                  displayName: payload.name,
                  email: payload.upn ?? payload.preferred_username,
                  scope: scopes,
                  scopeFlags
                }
              })
            } catch (err) {
              request.logger?.warn?.({ err }, 'OIDC token verification failed')

              throw Boom.unauthorized('Invalid token')
            }
          }
        }
      })
      server.auth.strategy('azure-oidc', 'azure-oidc-scheme')
    }
  }
}
