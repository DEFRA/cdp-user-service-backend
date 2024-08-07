import { withMongoTransaction } from '~/src/api/helpers/mongo/transactions/with-mongo-transaction'

async function addUserToTeam(request, userId, teamId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
    await db
      .collection('users')
      .findOneAndUpdate(
        { _id: userId },
        { $addToSet: { teams: teamId }, $set: { updatedAt: new Date() } }
      )

    return await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        $addToSet: { users: userId },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
  })
}

export { addUserToTeam }
