import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { appConfig } from '~/src/config'

const { ClientSecretCredential } = require('@azure/identity')
const { Client } = require('@microsoft/microsoft-graph-client')

const msGraphPlugin = {
  name: 'ms-graph',
  version: '1.0.0',
  register: async function (server) {
    const azureTenantId = appConfig.get('azureTenantId')
    const azureClientId = appConfig.get('azureClientId')
    const azureClientSecret = appConfig.get('azureClientSecret')

    server.logger.info('Setting up ms-graph')

    const credential = new ClientSecretCredential(
      azureTenantId,
      azureClientId,
      azureClientSecret
    )
    const options = { scopes: ['https://graph.microsoft.com/.default'] }
    const authProvider = new TokenCredentialAuthenticationProvider(
      credential,
      options
    )
    const msGraph = Client.initWithMiddleware({ authProvider })

    server.decorate('request', 'msGraph', msGraph)
  }
}

export { msGraphPlugin }
