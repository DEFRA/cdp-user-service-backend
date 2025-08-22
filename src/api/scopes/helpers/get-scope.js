import { ObjectId } from 'mongodb'

async function getScope(db, scopeId) {
  const scopes = await db
    .collection('scopes')
    .aggregate([
      { $match: { _id: new ObjectId(scopeId) } },
      {
        $set: {
          _userIds: '$users.userId',
          _teamIds: {
            $setUnion: ['$teams', '$users.teamId']
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { userIds: '$_userIds' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$userIds'] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'userDocs'
        }
      },
      {
        $lookup: {
          from: 'teams',
          let: { teamIds: '$_teamIds' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$teamIds'] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'teamDocs'
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
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [
            {
              $project: { name: 1, userId: '$_id', _id: 0 }
            }
          ]
        }
      },
      {
        $set: {
          _userNameMap: {
            $arrayToObject: {
              $map: {
                input: '$userDocs',
                as: 'userDoc',
                in: { k: { $toString: '$$userDoc._id' }, v: '$$userDoc.name' }
              }
            }
          },
          _teamNameMap: {
            $arrayToObject: {
              $map: {
                input: '$teamDocs',
                as: 'teamDoc',
                in: { k: { $toString: '$$teamDoc._id' }, v: '$$teamDoc.name' }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          scopeId: '$_id',
          value: 1,
          kind: 1,
          description: 1,
          users: {
            $map: {
              input: { $ifNull: ['$users', []] },
              as: 'user',
              in: {
                userId: '$$user.userId',
                userName: {
                  $let: {
                    vars: {
                      kv: {
                        $first: {
                          $filter: {
                            input: { $objectToArray: '$_userNameMap' },
                            as: 'kv',
                            cond: {
                              $eq: ['$$kv.k', { $toString: '$$user.userId' }]
                            }
                          }
                        }
                      }
                    },
                    in: '$$kv.v'
                  }
                },
                teamId: '$$user.teamId',
                teamName: {
                  $let: {
                    vars: {
                      kv: {
                        $first: {
                          $filter: {
                            input: { $objectToArray: '$_teamNameMap' },
                            as: 'kv',
                            cond: {
                              $eq: ['$$kv.k', { $toString: '$$user.teamId' }]
                            }
                          }
                        }
                      }
                    },
                    in: '$$kv.v'
                  }
                },
                startDate: '$$user.startDate',
                endDate: '$$user.endDate'
              }
            }
          },
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
          createdBy: {
            $first: '$createdBy'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    .toArray()
  return scopes?.at(0) ?? null
}

export { getScope }
