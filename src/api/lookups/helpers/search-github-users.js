import { config } from '../../../config/config.js'

async function searchGitHubUsers(octokit, query) {
  const org = config.get('github.org')
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
  return (
    allMembers?.organization?.membersWithRole?.nodes
      ?.filter(
        (user) =>
          user.name?.toLowerCase().includes(query?.toLowerCase()) ||
          user.github?.toLowerCase().includes(query?.toLowerCase())
      )
      .slice(0, 20) ?? []
  )
}

export { searchGitHubUsers }
