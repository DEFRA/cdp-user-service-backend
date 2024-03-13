async function searchAadUsers(msGraph, query) {
  const users = await msGraph
    .api(`/users`)
    .headers({ ConsistencyLevel: 'eventual' })
    .search(`"displayName:${query}" OR "mail:${query}"`)
    .select('id')
    .select('displayName')
    .select('mail')
    .select('userPrincipalName')
    .top(10)
    .get()
  return users?.value.map((user) => ({
    userId: user.id,
    name: user.displayName,
    email: user?.mail ?? user?.userPrincipalName
  }))
}

export { searchAadUsers }
