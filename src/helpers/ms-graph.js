import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { ClientSecretCredential } from '@azure/identity'
import {
  AuthenticationHandler,
  Client
} from '@microsoft/microsoft-graph-client'

import { config } from '~/src/config'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch'
import { proxyAgent } from '~/.server/helpers/proxy-agent'

class CDPHttpHandler {
  async execute(context) {
    context.response = await proxyFetch(context.request, context.options)
  }
}

const msGraphPlugin = {
  name: 'ms-graph',
  version: '1.0.0',
  register: async function (server) {
    const azureTenantId = config.get('azureTenantId')
    const azureClientId = config.get('azureClientId')
    const azureClientSecret = config.get('azureClientSecret')
    const azureClientBaseUrl = config.get('azureClientBaseUrl')

    server.logger.info('Setting up ms-graph')

    const proxy = proxyAgent()
    const agent = proxy?.agent

    const credentialOptions = {}

    if (agent) {
      credentialOptions.proxyOptions = {}
      credentialOptions.proxyOptions.host = proxy.url.href
      credentialOptions.proxyOptions.port = agent.connectOpts.port
      if (proxy.url.username && proxy.url.username !== '') {
        credentialOptions.proxyOptions.username = proxy.url.username
      }
      if (proxy.url.password && proxy.url.password !== '') {
        credentialOptions.proxyOptions.password = proxy.url.password
      }
    }

    const credential = new ClientSecretCredential(
      azureTenantId,
      azureClientId,
      azureClientSecret,
      credentialOptions
    )

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const httpMiddleware = []
    httpMiddleware.push(new AuthenticationHandler(authProvider))
    httpMiddleware.push(new CDPHttpHandler())

    const clientOptions = {
      middleware: httpMiddleware,
      debugLogging: true
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
