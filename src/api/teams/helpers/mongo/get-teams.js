import isNil from 'lodash/isNil.js'

async function getTeams(db, queryParams) {
  const stages = []
  const name = queryParams?.name
  const hasGithub = queryParams?.hasGithub

  if (!isNil(name)) {
    stages.push({
      $match: { name }
    })
  }

  if (!isNil(hasGithub)) {
    stages.push({
      $match: { github: { $exists: hasGithub } }
    })
  }

  stages.push({
    $lookup: {
      from: 'users',
      localField: 'users',
      foreignField: '_id',
      pipeline: [
        {
          $sort: { name: 1 }
        }
      ],
      as: 'users'
    }
  })

  stages.push({
    $project: {
      _id: 0,
      teamId: '$_id',
      name: 1,
      description: 1,
      github: 1,
      serviceCodes: 1,
      alertEmailAddresses: 1,
      customGroups: 1,
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

  stages.push({
    $sort: { name: 1 }
  })

  return await db.collection('teams').aggregate(stages).toArray()
}

async function getTeamsCount(db, query) {
  return await db.collection('teams').countDocuments(query)
}

export { getTeams, getTeamsCount }
