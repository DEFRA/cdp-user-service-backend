async function getScopes(db) {
  return await db
    .collection('scopes')
    .find(
      {},
      {
        sort: { value: 1 },
        projection: {
          _id: 0,
          scopeId: 1,
          value: 1,
          description: 1,
          kind: 1,
          teams: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )
    .toArray()
}

export { getScopes }
