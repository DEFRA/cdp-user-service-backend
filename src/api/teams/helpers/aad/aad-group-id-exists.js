async function aadGroupIdExists(msGraph, groupId) {
  try {
    await msGraph.api(`/groups/${groupId}`).get()
    return true
  } catch (error) {
    if (error?.statusCode === 404) {
      return false
    }
    throw error
  }
}

export { aadGroupIdExists }
