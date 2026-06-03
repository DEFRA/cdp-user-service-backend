import {
  ClientSecretCredential,
  ClientAssertionCredential
} from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'

import { config } from '../config/config.js'
import { getFederatedLoginToken } from './cognito.js'

function proxyOptions(proxyUrl) {
  const url = new URL(proxyUrl)
  return {
    proxyOptions: {
      host: url.href,
      port: Number(url.port),
      username: url?.username,
      password: url?.password
    }
  }
}

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

      const proxyUrl = config.get('httpProxy')

      const credentialOptions = proxyUrl ? proxyOptions(proxyUrl) : {}

      let credential

      if (config.get('azureFederatedCredentials.enabled')) {
        server.logger.info('Using federated credentials')
        credential = new ClientAssertionCredential(
          azureTenantId,
          azureClientId,
          getFederatedLoginToken,
          credentialOptions
        )
      } else {
        server.logger.info('Using client secret credentials')
        credential = new ClientSecretCredential(
          azureTenantId,
          azureClientId,
          azureClientSecret,
          credentialOptions
        )
      }

      const authProvider = new TokenCredentialAuthenticationProvider(
        credential,
        {
          scopes: ['https://graph.microsoft.com/.default']
        }
      )

      const msGraph = Client.initWithMiddleware({
        debugLogging: true,
        authProvider,
        baseUrl: azureClientBaseUrl
      })

      server.decorate('request', 'msGraph', msGraph)
    }
  }
}

export { msGraphPlugin }
