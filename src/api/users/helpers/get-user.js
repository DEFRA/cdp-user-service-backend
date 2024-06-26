async function getUser(db, userId) {
  const users = await db
    .collection('users')
    .aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'teams',
          localField: 'teams',
          foreignField: '_id',
          pipeline: [
            {
              $sort: { name: 1 }
            }
          ],
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
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    .toArray()
  return users?.at(0) ?? null
}

export { getUser }
