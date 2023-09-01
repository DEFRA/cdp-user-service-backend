import { appConfig } from '~/src/config'

async function searchGitHubTeams(octokit, query) {
  const org = appConfig.get('gitHubOrg')
  const orgTeamsQuery = `
  query orgTeams($cursor: String, $orgName: String!) {
    organization(login: $orgName) {
      teams(first: 100, after: $cursor) {
        nodes {
          github: slug
          name
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }`

  const allTeams = await octokit.graphql.paginate(orgTeamsQuery, {
    orgName: org,
    searchQuery: query
  })
  return allTeams?.organization?.teams?.nodes
    ?.filter(
      (team) => team.name?.includes(query) || team.github?.includes(query)
    )
    .slice(0, 10)
}

export { searchGitHubTeams }
