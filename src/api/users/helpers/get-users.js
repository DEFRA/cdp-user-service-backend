async function getUsers(db) {
  return await db
    .collection('users')
    .aggregate([
      {
        $lookup: {
          from: 'teams',
          localField: 'teams',
          foreignField: '_id',
          as: 'teams'
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
          teams: {
            $map: {
              input: '$teams',
              as: 'team',
              in: {
                teamId: '$$team._id',
                name: '$$team.name'
              }
            }
          }
        }
      }
    ])
    .toArray()
}

export { getUsers }
