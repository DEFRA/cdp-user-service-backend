async function getTeam(db, teamId) {
  const teams = await db
    .collection('teams')
    .aggregate([
      { $match: { _id: teamId } },
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
      }
    ])
    .toArray()
  return teams?.at(0) ?? null
}

export { getTeam }
