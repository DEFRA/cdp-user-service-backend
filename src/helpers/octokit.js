import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { paginateGraphql } from '@octokit/plugin-paginate-graphql'

import { config } from '~/src/config'

const octokitPlugin = {
  name: 'octokit',
  version: '1.0.0',
  register: async function (server) {
    const gitHubAppId = config.get('gitHubAppId')
    const gitHubAppPrivateKey = config.get('gitHubAppPrivateKey')
    const gitHubAppInstallationId = config.get('gitHubAppInstallationId')

    server.logger.info('Setting up octokit')

    const OctokitExtra = Octokit.plugin(paginateGraphql)
    const octokit = new OctokitExtra({
      authStrategy: createAppAuth,
      auth: {
        appId: gitHubAppId,
        privateKey: Buffer.from(gitHubAppPrivateKey, 'base64'),
        installationId: gitHubAppInstallationId
      }
    })

    server.decorate('request', 'octokit', octokit)
  }
}

export { octokitPlugin }
