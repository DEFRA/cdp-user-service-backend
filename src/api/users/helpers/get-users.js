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
      }
    ])
    .toArray()
}

export { getUsers }
