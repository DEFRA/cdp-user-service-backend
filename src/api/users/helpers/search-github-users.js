import { appConfig } from '~/src/config'

async function searchGitHubUsers(octokit, query) {
  const org = appConfig.get('gitHubOrg')
  const orgUsersQuery = `
  query orgUsers($cursor: String, $orgName: String!) {
    organization(login: $orgName) {
      membersWithRole(first: 100, after: $cursor) {
        nodes {
          github: login
          name
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }`

  const allMembers = await octokit.graphql.paginate(orgUsersQuery, {
    orgName: org,
    searchQuery: query
  })
  return allMembers?.organization?.membersWithRole?.nodes
    ?.filter(
      (user) => user.name?.includes(query) || user.github?.includes(query)
    )
    .slice(0, 10)
}

export { searchGitHubUsers }
