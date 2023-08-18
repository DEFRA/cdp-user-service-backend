async function userIdExists(graphClient, userId) {
  try {
    await graphClient.api(`/users/${userId}`).get()
    return true
  } catch (error) {
    if (error.statusCode === 404) {
      return false
    } else {
      throw error
    }
  }
}

export { userIdExists }
