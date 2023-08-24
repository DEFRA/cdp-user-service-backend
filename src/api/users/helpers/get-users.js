import { isNil } from 'lodash'

async function getUsers(db, query) {
  const stages = []

  if (!isNil(query)) {
    stages.push({
      $match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }
    })
  }

  stages.push({
    $lookup: {
      from: 'teams',
      localField: 'teams',
      foreignField: '_id',
      as: 'teams'
    }
  })

  stages.push({
    $project: {
      _id: 0,
      userId: '$_id',
      name: 1,
      email: 1,
      github: 1,
      defraVpnId: 1,
      defraAwsId: 1,
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
      createdAt: 1,
      updatedAt: 1
    }
  })

  return await db.collection('users').aggregate(stages).toArray()
}

export { getUsers }
