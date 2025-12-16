async function getScope(db, scopeId) {
  const scopes = await db
    .collection('scopes')
    .aggregate([
      { $match: { scopeId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { name: 1, userId: '$_id', _id: 0 } }]
        }
      },
      {
        $project: {
          _id: 0,
          scopeId: 1,
          value: 1,
          kind: 1,
          description: 1,
          users: 1,
          members: 1,
          createdAt: 1,
          updatedAt: 1,
          teams: 1,
          userId: 1,
          createdBy: {
            $first: '$createdBy'
          }
        }
      }
    ])
    .toArray()
  return scopes?.at(0) ?? null
}

export { getScope }
