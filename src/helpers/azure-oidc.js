import { appConfig } from '~/src/config'

const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: (server) => {
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
    }
  }
}

export { azureOidc }
