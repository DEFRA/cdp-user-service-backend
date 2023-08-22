async function getTeams(db) {
  return await db
    .collection('teams')
    .aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users'
        }
      },
      {
        $project: {
          _id: 0,
          teamId: '$_id',
          name: 1,
          description: 1,
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
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    .toArray()
}

export { getTeams }
