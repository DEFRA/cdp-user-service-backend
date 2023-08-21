async function aadUserIdExists(graphClient, userId) {
  try {
    await graphClient.api(`/users/${userId}`).get()
    return true
  } catch (error) {
    if (error?.statusCode === 404) {
      return false
    }
    throw error
  }
}

export { aadUserIdExists }
