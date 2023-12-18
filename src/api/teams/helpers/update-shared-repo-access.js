import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

const updateSharedRepoAccess = async (octokit, githubTeam) => {
  const orgName = config.get('gitHubOrg')
  const sharedRepos = config.get('sharedRepos')

  const p = sharedRepos.map((sharedRepo) => {
    logger.info(`Granting ${githubTeam} access to ${orgName}/${sharedRepo}`)
    return octokit.request(
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
  })

  await Promise.all(p)
}

export { updateSharedRepoAccess }
