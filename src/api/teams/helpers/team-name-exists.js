async function teamNameExists(graphClient, name) {
  const group = await graphClient
    .api('/groups')
    .filter(`displayName eq '${name}'`)
    .get()
  return group.value.length > 0
}

export { teamNameExists }
