import { config } from '../../../../config/config.js'
import { createLogger } from '../../../../helpers/logging/logger.js'

const logger = createLogger()

// returns 204 response if team already has access
const addSharedRepoAccess = async (octokit, githubTeam) => {
  const orgName = config.get('github.org')
  const sharedRepos = config.get('sharedRepos')

  const octokitPromises = sharedRepos.map((repo) => {
    logger.info(`Granting ${githubTeam} access to ${orgName}/${repo}`)
    return octokit.request(
      'PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
      {
        org: orgName,
        team_slug: githubTeam,
        owner: orgName,
        repo,
        permission: 'push',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
  })
  return await Promise.all(octokitPromises)
}

// returns 204 response if team doesn't have access
const deleteSharedRepoAccess = async (octokit, githubTeam) => {
  const orgName = config.get('github.org')
  const sharedRepos = config.get('sharedRepos')

  const octokitPromises = sharedRepos.map((repo) => {
    logger.info(`Deleting ${githubTeam} access to ${orgName}/${repo}`)
    return octokit.request(
      'DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
      {
        org: orgName,
        team_slug: githubTeam,
        owner: orgName,
        repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
  })

  return await Promise.all(octokitPromises)
}

export { addSharedRepoAccess, deleteSharedRepoAccess }
