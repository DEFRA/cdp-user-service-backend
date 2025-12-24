async function aadUserIdExists(msGraph, userId) {
  try {
    await msGraph.api(`/users/${userId}`).get()
    return true
  } catch (error) {
    if (error?.statusCode === 404) {
      return false
    }
    throw error
  }
}

export { aadUserIdExists }
