async function userIdExists(graphClient, userId) {
  try {
    await graphClient.api(`/users/${userId}`).get()
    return true
  } catch (error) {
    return false
  }
}

export { userIdExists }
