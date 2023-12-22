import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'

import { config } from '~/src/config'

const msGraphPlugin = {
  name: 'ms-graph',
  version: '1.0.0',
  register: async function (server) {
    const azureTenantId = config.get('azureTenantId')
    const azureClientId = config.get('azureClientId')
    const azureClientSecret = config.get('azureClientSecret')
    const azureClientBaseUrl = config.get('azureClientBaseUrl')

    server.logger.info('Setting up ms-graph')

    const credential = new ClientSecretCredential(
      azureTenantId,
      azureClientId,
      azureClientSecret
    )

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const clientOptions = {
      authProvider
    }
    if (azureClientBaseUrl !== null) {
      clientOptions.baseUrl = azureClientBaseUrl
    }
    const msGraph = Client.initWithMiddleware(clientOptions)

    server.decorate('request', 'msGraph', msGraph)
  }
}

export { msGraphPlugin }
