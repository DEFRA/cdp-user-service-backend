import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { config } from '~/src/config'
import { provideProxy } from '~/src/helpers/proxy'

const msGraphPlugin = {
  plugin: {
    name: 'ms-graph',
    version: '1.0.0',
    register: async function (server) {
      const azureTenantId = config.get('azureTenantId')
      const azureClientId = config.get('azureClientId')
      const azureClientSecret = config.get('azureClientSecret')
      const azureClientBaseUrl = config.get('azureClientBaseUrl')

      server.logger.info('Setting up ms-graph')

      const proxy = provideProxy()
      const credentialOptions = proxy
        ? {
            proxyOptions: {
              host: proxy.url.href,
              port: proxy.port,
              username: proxy.url?.username,
              password: proxy.url?.password
            }
          }
        : {}

      const credential = new ClientSecretCredential(
        azureTenantId,
        azureClientId,
        azureClientSecret,
        credentialOptions
      )

      const authProvider = new TokenCredentialAuthenticationProvider(
        credential,
        {
          scopes: ['https://graph.microsoft.com/.default']
        }
      )

      const clientOptions = {
        debugLogging: true,
        authProvider,
        ...(proxy && {
          fetchOptions: {
            dispatcher: proxy.proxyAgent
          }
        })
      }

      if (azureClientBaseUrl !== '') {
        server.logger.debug(
          `Overriding azure client base url with ${azureClientBaseUrl}`
        )
        clientOptions.baseUrl = azureClientBaseUrl
      }
      const msGraph = Client.initWithMiddleware(clientOptions)

      server.decorate('request', 'msGraph', msGraph)
    }
  }
}

export { msGraphPlugin }
