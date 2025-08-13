export const userAggregation = (currentDateTime = new Date()) => [
  // 1) Load teams (only what we need)
  {
    $lookup: {
      from: 'teams',
      localField: 'teams',
      foreignField: '_id',
      pipeline: [
        { $sort: { name: 1 } },
        { $project: { _id: 1, name: 1, scopes: 1 } }
      ],
      as: 'teamDocs'
    }
  },

  // 2) Merge team scopes into root scopes (user first -> user takes precedence later)
  {
    $set: {
      scopes: {
        $concatArrays: [
          { $ifNull: ['$scopes', []] }, // user-level: may include teamId/startDate/endDate
          {
            // Flatten team scope ObjectIds and wrap as { scopeId }
            $map: {
              input: {
                $reduce: {
                  input: {
                    $map: {
                      input: { $ifNull: ['$teamDocs', []] },
                      as: 't',
                      in: { $ifNull: ['$$t.scopes', []] }
                    }
                  },
                  initialValue: [],
                  in: { $concatArrays: ['$$value', '$$this'] }
                }
              },
              as: 'sid',
              in: { scopeId: '$$sid' } // team-derived: only scopeId
            }
          }
        ]
      }
    }
  },

  // 3) Normalize scopeId to ObjectId (so $in / $lookup work reliably)
  {
    $set: {
      scopes: {
        $map: {
          input: '$scopes',
          as: 's',
          in: {
            scopeId: {
              $cond: [
                { $eq: [{ $type: '$$s.scopeId' }, 'string'] },
                { $toObjectId: '$$s.scopeId' },
                '$$s.scopeId'
              ]
            },
            teamId: '$$s.teamId',
            startDate: '$$s.startDate',
            endDate: '$$s.endDate'
          }
        }
      }
    }
  },

  // 4) Keep only "active now" — robust coercion for strings/dates/empties
  {
    $set: {
      scopes: {
        $filter: {
          input: '$scopes',
          as: 's',
          cond: {
            $let: {
              vars: {
                sStart: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $type: '$$s.startDate' }, 'date'] },
                        then: '$$s.startDate'
                      },
                      {
                        case: { $eq: [{ $type: '$$s.startDate' }, 'string'] },
                        then: {
                          $convert: {
                            input: '$$s.startDate',
                            to: 'date',
                            onError: null,
                            onNull: null
                          }
                        }
                      }
                    ],
                    default: null
                  }
                },
                sEnd: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $type: '$$s.endDate' }, 'date'] },
                        then: '$$s.endDate'
                      },
                      {
                        case: { $eq: [{ $type: '$$s.endDate' }, 'string'] },
                        then: {
                          $convert: {
                            input: '$$s.endDate',
                            to: 'date',
                            onError: null,
                            onNull: null
                          }
                        }
                      }
                    ],
                    default: null
                  }
                }
              },
              in: {
                $and: [
                  {
                    $or: [
                      { $eq: ['$$sStart', null] },
                      { $lte: ['$$sStart', currentDateTime] }
                    ]
                  },
                  {
                    $or: [
                      { $eq: ['$$sEnd', null] },
                      { $gte: ['$$sEnd', currentDateTime] }
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

  // 5) Put user-level scopes first (have any of teamId/startDate/endDate)
  {
    $set: {
      scopes: {
        $concatArrays: [
          {
            $filter: {
              input: '$scopes',
              as: 's',
              cond: {
                $or: [
                  { $ne: [{ $ifNull: ['$$s.teamId', null] }, null] },
                  { $ne: [{ $ifNull: ['$$s.startDate', null] }, null] },
                  { $ne: [{ $ifNull: ['$$s.endDate', null] }, null] }
                ]
              }
            }
          },
          {
            $filter: {
              input: '$scopes',
              as: 's',
              cond: {
                $and: [
                  { $eq: [{ $ifNull: ['$$s.teamId', null] }, null] },
                  { $eq: [{ $ifNull: ['$$s.startDate', null] }, null] },
                  { $eq: [{ $ifNull: ['$$s.endDate', null] }, null] }
                ]
              }
            }
          }
        ]
      }
    }
  },

  // 6) De-dupe by scopeId preserving FIRST occurrence (user-first wins)
  {
    $set: {
      scopes: {
        $reduce: {
          input: '$scopes',
          initialValue: [],
          in: {
            $cond: [
              {
                $in: [
                  '$$this.scopeId',
                  { $map: { input: '$$value', as: 'v', in: '$$v.scopeId' } }
                ]
              },
              '$$value',
              { $concatArrays: ['$$value', ['$$this']] }
            ]
          }
        }
      }
    }
  },

  // 7) Lookup scope names
  {
    $lookup: {
      from: 'scopes',
      localField: 'scopes.scopeId',
      foreignField: '_id',
      as: 'scopeDocs'
    }
  },

  // 8) Build final scopes array: include user-scope metadata if present
  {
    $set: {
      scopes: {
        $map: {
          input: '$scopes',
          as: 's',
          in: {
            scopeId: '$$s.scopeId',
            scopeName: {
              $getField: {
                field: 'value', // constant field name is required by $getField
                input: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$scopeDocs',
                        as: 'sd',
                        cond: { $eq: ['$$sd._id', '$$s.scopeId'] }
                      }
                    },
                    0
                  ]
                }
              }
            },
            teamId: '$$s.teamId',
            startDate: '$$s.startDate',
            endDate: '$$s.endDate'
          }
        }
      }
    }
  },

  // 9) Return teams with only id & name
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

  // 10) Clean up helpers
  { $unset: ['teamDocs', 'scopeDocs'] },

  // 11) Rename _id to userId
  { $set: { userId: '$_id' } },
  { $unset: '_id' }
]
