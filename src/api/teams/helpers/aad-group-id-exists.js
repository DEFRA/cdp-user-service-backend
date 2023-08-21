async function aadGroupIdExists(graphClient, groupId) {
  try {
    await graphClient.api(`/groups/${groupId}`).get()
    return true
  } catch (error) {
    if (error?.statusCode === 404) {
      return false
    }
    throw error
  }
}

export { aadGroupIdExists }
