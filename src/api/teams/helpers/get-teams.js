import { isNil } from 'lodash'

async function getTeams(db, query) {
  const stages = []

  if (!isNil(query)) {
    stages.push({
      $match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }
    })
  }

  stages.push({
    $lookup: {
      from: 'users',
      localField: 'users',
      foreignField: '_id',
      as: 'users'
    }
  })

  stages.push({
    $project: {
      _id: 0,
      teamId: '$_id',
      name: 1,
      description: 1,
      users: {
        $map: {
          input: '$users',
          as: 'user',
          in: {
            userId: '$$user._id',
            name: '$$user.name'
          }
        }
      },
      createdAt: 1,
      updatedAt: 1
    }
  })

  return await db.collection('teams').aggregate(stages).toArray()
}

export { getTeams }
