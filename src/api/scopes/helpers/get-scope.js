import { ObjectId } from 'mongodb'

async function getScope(db, scopeId) {
  const scopes = await db
    .collection('scopes')
    .aggregate([
      { $match: { _id: new ObjectId(scopeId) } },
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
          scopeId: '$_id',
          value: 1,
          kind: 1,
          description: 1,
          users: 1,
          createdAt: 1,
          updatedAt: 1,
          teams: 1,
          createdBy: {
            $first: '$createdBy'
          }
        }
      },
      { $unset: ['teamDocs'] },
      { $set: { userId: '$_id' } },
      { $unset: '_id' }
    ])
    .toArray()
  return scopes?.at(0) ?? null
}

export { getScope }
