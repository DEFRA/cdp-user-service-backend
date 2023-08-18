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
          as: 'users'
        }
      }
    ])
    .toArray()
  return teams[0] || null
}

export { getTeam }
