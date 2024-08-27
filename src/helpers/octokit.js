import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { paginateGraphql } from '@octokit/plugin-paginate-graphql'

import { config } from '~/src/config/index.js'
import { proxyFetch } from '~/src/helpers/proxy.js'

const octokitPlugin = {
  plugin: {
    name: 'octokit',
    version: '1.0.0',
    register: (server) => {
      const gitHubAppId = config.get('gitHubAppId')
      const gitHubAppPrivateKey = config.get('gitHubAppPrivateKey')
      const gitHubAppInstallationId = config.get('gitHubAppInstallationId')

      server.logger.info('Setting up octokit')

      const cfg = !config.get('gitHubBaseUrl')
        ? {
            authStrategy: createAppAuth,
            auth: {
              appId: gitHubAppId,
              privateKey: Buffer.from(gitHubAppPrivateKey, 'base64'),
              installationId: gitHubAppInstallationId
            },
            request: { fetch: proxyFetch }
          }
        : {
            // Test Mode, for use with cdp-portal-stubs
            auth: 'test-value',
            baseUrl: config.get('gitHubBaseUrl')
          }

      const OctokitExtra = Octokit.plugin(paginateGraphql)
      const octokit = new OctokitExtra(cfg)
      server.decorate('request', 'octokit', octokit)
    }
  }
}

export { octokitPlugin }
