import { ObjectId } from 'mongodb'

async function getScope(db, scopeId) {
  const scopes = await db
    .collection('scopes')
    .aggregate([
      { $match: { _id: new ObjectId(scopeId) } },
      {
        $lookup: {
          from: 'teams',
          localField: 'teams',
          foreignField: '_id',
          pipeline: [
            {
              $sort: { name: 1 }
            }
          ],
          as: 'teams'
        }
      },
      {
        $lookup: {
          from: 'scopes',
          localField: 'scopes',
          foreignField: '_id',
          pipeline: [
            {
              $sort: { value: 1 }
            }
          ],
          as: 'scopes'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [
            {
              $project: { name: 1, userId: '$_id', _id: 0 }
            }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          scopeId: '$_id',
          value: 1,
          description: 1,
          teams: {
            $map: {
              input: '$teams',
              as: 'team',
              in: {
                teamId: '$$team._id',
                name: '$$team.name'
              }
            }
          },
          createdBy: {
            $first: '$createdBy'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    .toArray()
  return scopes?.at(0) ?? null
}

export { getScope }
