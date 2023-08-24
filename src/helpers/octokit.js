import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { paginateGraphql } from '@octokit/plugin-paginate-graphql'

import { createLogger } from '~/src/helpers/logger'
import { appConfig } from '~/src/config'

const logger = createLogger()

const octokitPlugin = {
  name: 'octokit',
  version: '1.0.0',
  register: async function (server) {
    const gitHubAppId = appConfig.get('gitHubAppId')
    const gitHubAppPrivateKey = appConfig.get('gitHubAppPrivateKey')
    const gitHubAppInstallationId = appConfig.get('gitHubAppInstallationId')

    logger.info('Setting up octokit')

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
