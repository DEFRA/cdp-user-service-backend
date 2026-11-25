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

export const githubOrgMembersPlugin = {
  name: 'github-org-members',
  register: (server, { org, cache }) => {
    server.method({
      name: 'getGitHubOrgMembers',
      method: async () => {
        const response = await server.octokit.graphql.paginate(orgUsersQuery, {
          orgName: org
        })

        const members = response?.organization?.membersWithRole?.nodes

        if (!members) {
          throw new Error('Failed to retrieve GitHub organisation members')
        }

        return members
      },
      options: {
        cache: {
          staleIn: cache.staleIn,
          staleTimeout: cache.staleTimeout,
          generateTimeout: cache.generateTimeout,
          pendingGenerateTimeout: cache.generateTimeout,
          expiresIn: cache.expiresIn,
          dropOnError: false
        }
      }
    })

    // Preload the cache without blocking startup
    server.methods.getGitHubOrgMembers().catch((error) => {
      server.logger.error(
        error,
        'Failed to preload GitHub organisation members cache'
      )
    })
  }
}
