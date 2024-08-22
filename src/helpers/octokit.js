import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { paginateGraphql } from '@octokit/plugin-paginate-graphql'

import { config } from '~/src/config'
import { proxyFetch } from '~/src/helpers/proxy'

const octokitPlugin = {
  plugin: {
    name: 'octokit',
    version: '1.0.0',
    register: async function (server) {
      const gitHubAppId = config.gitHubAppId
      const gitHubAppPrivateKey = config.gitHubAppPrivateKey
      const gitHubAppInstallationId = config.gitHubAppInstallationId

      server.logger.info('Setting up octokit')

      const cfg =
        config.gitHubBaseUrl == null
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
              baseUrl: config.gitHubBaseUrl
            }

      const OctokitExtra = Octokit.plugin(paginateGraphql)
      const octokit = new OctokitExtra(cfg)
      server.decorate('request', 'octokit', octokit)
    }
  }
}

export { octokitPlugin }
