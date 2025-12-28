const userWithTeamsAggregation = [
  {
    $lookup: {
      from: 'relationships',
      localField: '_id',
      foreignField: 'subject',
      as: 'teams',
      pipeline: [
        { $match: { relation: 'member' } },
        {
          $lookup: {
            from: 'teams',
            localField: 'resource',
            foreignField: '_id',
            as: 'data'
          }
        },
        { $unwind: '$data' },
        { $replaceRoot: { newRoot: '$data' } },
        { $project: { _id: 0, teamId: '$_id', name: 1, description: 1 } }
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
        { $match: { relation: 'granted' } },
        { $project: { _id: 0, scopeId: '$resource', scopeName: '$resource' } }
      ]
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
      scopes: 1,
      teams: 1,
      userId: '$_id'
    }
  }
]

export { userWithTeamsAggregation }
