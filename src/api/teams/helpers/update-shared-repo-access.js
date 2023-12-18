import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

const updateSharedRepoAccess = async (octokit, githubTeam) => {
  const orgName = config.get('gitHubOrg')
  const sharedRepos = config.get('sharedRepos')

  for (const sharedRepo of sharedRepos) {
    logger.info(`Granting ${githubTeam} access to ${orgName}/${sharedRepo}`)
    await octokit.request(
      'PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
      {
        org: orgName,
        team_slug: githubTeam,
        owner: orgName,
        repo: sharedRepo,
        permission: 'push',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
  }
}

export { updateSharedRepoAccess }
