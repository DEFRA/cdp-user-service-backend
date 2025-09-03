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
          input: { $ifNull: ['$users', []] },
          as: 'user',
          in: {
            userId: '$$user._id',
            name: '$$user.name',
            hasBreakGlass: {
              $anyElementTrue: {
                $map: {
                  input: { $ifNull: ['$$user.scopes', []] },
                  as: 'scope',
                  in: {
                    $and: [
                      { $eq: ['$$scope.scopeName', 'breakGlass'] },
                      {
                        $or: [
                          // open-ended (no dates set)
                          {
                            $and: [
                              { $not: ['$$scope.startDate'] },
                              { $not: ['$$scope.endDate'] }
                            ]
                          },
                          // active now
                          {
                            $and: [
                              { $lte: ['$$scope.startDate', '$$NOW'] },
                              {
                                $or: [
                                  { $gte: ['$$scope.endDate', '$$NOW'] },
                                  { $not: ['$$scope.endDate'] }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      scopes: 1,
      createdAt: 1,
      updatedAt: 1
    }
  }
]
