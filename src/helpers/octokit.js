import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { paginateGraphQL } from '@octokit/plugin-paginate-graphql'

import { config } from '../config/config.js'
import { proxyFetch } from './proxy.js'

const octokitPlugin = {
  plugin: {
    name: 'octokit',
    version: '1.0.0',
    register: (server) => {
      const gitHubAppId = config.get('gitHubAppId')
      const gitHubAppPrivateKey = config.get('gitHubAppPrivateKey')
      const gitHubAppInstallationId = config.get('gitHubAppInstallationId')

      server.logger.info('Setting up octokit')

      const commonConfig = {
        authStrategy: createAppAuth,
        auth: {
          appId: gitHubAppId,
          privateKey: Buffer.from(gitHubAppPrivateKey, 'base64').toString(
            'utf8'
          ),
          installationId: gitHubAppInstallationId
        },
        request: { fetch: proxyFetch }
      }

      const cfg = config.get('github.baseUrl')
        ? {
            ...commonConfig,
            // Test Mode, for use with cdp-portal-stubs
            baseUrl: config.get('github.baseUrl')
          }
        : commonConfig

      const OctokitExtra = Octokit.plugin(paginateGraphQL)
      const octokit = new OctokitExtra(cfg)
      server.decorate('request', 'octokit', octokit)
    }
  }
}

export { octokitPlugin }
