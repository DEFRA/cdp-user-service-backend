import { config } from '~/src/config'

async function searchGitHubTeams(octokit, query) {
  const org = config.get('gitHubOrg')
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
      (team) =>
        team.name?.toLowerCase().includes(query.toLowerCase()) ||
        team.github?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 20)
}

export { searchGitHubTeams }
