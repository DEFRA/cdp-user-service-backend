export const teamAggregation = [
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
    $project: {
      _id: 0,
      teamId: '$_id',
      name: 1,
      description: 1,
      github: 1,
      serviceCodes: 1,
      alertEmailAddresses: 1,
      alertEnvironments: 1,
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
      scopes: 1,
      createdAt: 1,
      updatedAt: 1
    }
  }
]
