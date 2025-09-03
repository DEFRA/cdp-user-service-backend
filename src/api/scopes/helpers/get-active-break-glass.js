async function getActiveBreakGlass(db, credentials) {
  const userId = credentials.id

  const users = await db
    .collection('users')
    .aggregate([
      { $match: { _id: userId } },
      {
        $project: {
          _id: 0,
          activeBreakGlass: {
            $let: {
              vars: {
                arr: {
                  $filter: {
                    input: { $ifNull: ['$scopes', []] },
                    as: 's',
                    cond: {
                      $and: [
                        { $eq: ['$$s.scopeName', 'breakGlass'] },
                        {
                          $or: [
                            {
                              $and: [
                                { $not: ['$$s.startDate'] },
                                { $not: ['$$s.endDate'] }
                              ]
                            },
                            {
                              $and: [
                                { $lte: ['$$s.startDate', '$$NOW'] },
                                {
                                  $or: [
                                    { $gte: ['$$s.endDate', '$$NOW'] },
                                    { $not: ['$$s.endDate'] }
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
              in: {
                $cond: [
                  { $gt: [{ $size: '$$arr' }, 0] },
                  {
                    $let: {
                      vars: { s0: { $arrayElemAt: ['$$arr', 0] } },
                      in: {
                        scopeId: '$$s0.scopeId',
                        scopeName: '$$s0.scopeName',
                        teamId: '$$s0.teamId',
                        teamName: '$$s0.teamName',
                        startAt: '$$s0.startDate',
                        endAt: '$$s0.endDate'
                      }
                    }
                  },
                  null
                ]
              }
            }
          }
        }
      }
    ])
    .toArray()
  return users?.at(0) ?? {}
}

export { getActiveBreakGlass }
