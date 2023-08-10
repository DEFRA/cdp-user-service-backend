function normaliseUser(user) {
  const { _id, ...rest } = user
  return { aadId: _id, ...rest }
}

export { normaliseUser }
