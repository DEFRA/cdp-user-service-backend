import { appConfig } from '~/src/config'

async function gitHubTeamExists(octokit, github) {
  const org = appConfig.get('gitHubOrg')
  const teamExistsInOrgQuery = `
  query teamExistsInOrg($team: String!, $orgName: String!) {
    organization(login: $orgName) {
      team(slug: $team) {
        github: slug
      }
    }
  }`

  const result = await octokit.graphql(teamExistsInOrgQuery, {
    team: github,
    orgName: org
  })
  return result?.organization?.team?.github === github
}

export { gitHubTeamExists }