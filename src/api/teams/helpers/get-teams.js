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
      }
    ])
    .toArray()
}

export { getTeams }
