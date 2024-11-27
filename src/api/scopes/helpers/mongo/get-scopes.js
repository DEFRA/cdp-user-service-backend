async function getScopes(db) {
  return await db
    .collection('scopes')
    .find({}, { sort: { name: 1 } })
    .toArray()
}

export { getScopes }
