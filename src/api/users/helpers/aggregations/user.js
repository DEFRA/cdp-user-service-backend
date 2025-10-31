export const userAggregation = [
  {
    $lookup: {
      from: 'teams',
      localField: 'teams',
      foreignField: '_id',
      pipeline: [{ $sort: { name: 1 } }, { $project: { _id: 1, name: 1 } }],
      as: 'teamDocs'
    }
  },
  {
    $set: {
      teams: {
        $map: {
          input: { $ifNull: ['$teamDocs', []] },
          as: 't',
          in: { teamId: '$$t._id', name: '$$t.name' }
        }
      }
    }
  },
  { $set: { userId: '$_id' } },
  { $set: { subject: '$_id' } },
  {
    $graphLookup: {
      from: 'relationships',
      startWith: '$subject',
      connectFromField: 'object',
      connectToField: 'subject',
      as: 'relationships'
    }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      email: 1,
      github: 1,
      createdAt: 1,
      updatedAt: 1,
      relationships: 1,
      teams: {
        $map: {
          input: '$teamDocs',
          as: 'team',
          in: {
            teamId: '$$team._id',
            name: '$$team.name'
          }
        }
      },
      scopes: 1,
      hasBreakGlass: {
        $anyElementTrue: {
          $map: {
            input: { $ifNull: ['$scopes', []] },
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
      },
      userId: '$_id'
    }
  },
  { $unset: ['teamDocs'] },
  { $unset: '_id' }
]
