import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'

import { config } from '~/src/config/index.js'
import { provideProxy } from '~/src/helpers/proxy.js'

const msGraphPlugin = {
  plugin: {
    name: 'ms-graph',
    version: '1.0.0',
    register: (server) => {
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

      const msGraph = Client.initWithMiddleware({
        debugLogging: true,
        authProvider,
        baseUrl: azureClientBaseUrl,
        ...(proxy && {
          fetchOptions: {
            // @ts-expect-error This is not typed. See microsoftgraph/msgraph-sdk-javascript#1646 (comment)
            dispatcher: proxy.proxyAgent
          }
        })
      })

      server.decorate('request', 'msGraph', msGraph)
    }
  }
}

export { msGraphPlugin }
