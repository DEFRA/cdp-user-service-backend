import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'

import { config } from '~/src/config'
import { ProxyAgent } from '~/src/helpers/proxy-agent'

const msGraphPlugin = {
  name: 'ms-graph',
  version: '1.0.0',
  register: async function (server) {
    const azureTenantId = config.get('azureTenantId')
    const azureClientId = config.get('azureClientId')
    const azureClientSecret = config.get('azureClientSecret')
    const azureClientBaseUrl = config.get('azureClientBaseUrl')

    server.logger.info('Setting up ms-graph')

    const proxyAgent = ProxyAgent?.agent

    const credential = new ClientSecretCredential(
      azureTenantId,
      azureClientId,
      azureClientSecret,
      proxyAgent === null
        ? {}
        : {
            proxyOptions: {
              host: ProxyAgent?.url.hostname,
              port: ProxyAgent?.url.port
            }
          }
    )

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const clientOptions =
      proxyAgent === null
        ? { authProvider }
        : {
            authProvider,
            fetchOptions: {
              agent: proxyAgent
            }
          }

    if (azureClientBaseUrl !== '') {
      server.logger.info(
        `overriding azure client base url with ${azureClientBaseUrl}`
      )
      clientOptions.baseUrl = azureClientBaseUrl
    }
    const msGraph = Client.initWithMiddleware(clientOptions)

    server.decorate('request', 'msGraph', msGraph)
  }
}

export { msGraphPlugin }
