export const userAggregation = [
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
    $project: {
      _id: 0,
      userId: '$_id',
      name: 1,
      email: 1,
      github: 1,
      defraVpnId: 1,
      defraAwsId: 1,
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
  }
]
