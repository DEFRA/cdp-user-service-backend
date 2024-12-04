import isNil from 'lodash/isNil.js'

async function getTeams(db, queryParams) {
  const stages = []
  const query = queryParams?.query
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

  if (!isNil(query)) {
    stages.push({
      $match: {
        $or: [{ name: { $regex: query, $options: 'i' } }]
      }
    })
  }

  stages.push(
    {
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
    },
    {
      $lookup: {
        from: 'scopes',
        localField: 'scopes',
        foreignField: '_id',
        pipeline: [
          {
            $sort: { name: 1 }
          }
        ],
        as: 'scopes'
      }
    }
  )

  stages.push({
    $project: {
      _id: 0,
      teamId: '$_id',
      name: 1,
      description: 1,
      github: 1,
      serviceCodes: 1,
      alertEmailAddresses: 1,
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
      scopes: {
        $map: {
          input: '$scopes',
          as: 'scope',
          in: {
            scopeId: '$$scope._id',
            value: '$$scope.value'
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
