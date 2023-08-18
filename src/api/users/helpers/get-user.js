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
          as: 'teams'
        }
      }
    ])
    .toArray()
  return users[0] || null
}

export { getUser }
