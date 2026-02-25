export const teamWithUserAggregation = [
  {
    $lookup: {
      from: 'relationships',
      localField: '_id',
      foreignField: 'resource',
      as: 'users',
      pipeline: [
        { $match: { relation: 'member', resourceType: 'team' } },
        {
          $lookup: {
            from: 'users',
            localField: 'subject',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $replaceRoot: { newRoot: '$user' } },
        { $project: { userId: '$_id', _id: 0, name: 1 } }
      ]
    }
  },
  {
    $lookup: {
      from: 'relationships',
      localField: '_id',
      foreignField: 'subject',
      as: 'scopes',
      pipeline: [
        { $match: { relation: 'granted', resourceType: 'permission' } },
        { $project: { scopeId: '$resource', scopeName: '$resource', _id: 0 } }
      ]
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
      slackChannels: 1,
      users: 1,
      scopes: 1,
      createdAt: 1,
      updatedAt: 1
    }
  }
]
