async function searchGitHubUsers(server, query) {
  const members = await server.methods.getGitHubOrgMembers()
  return (
    members
      ?.filter(
        (user) =>
          user.name?.toLowerCase().includes(query?.toLowerCase()) ||
          user.github?.toLowerCase().includes(query?.toLowerCase())
      )
      .slice(0, 20) ?? []
  )
}

export { searchGitHubUsers }
