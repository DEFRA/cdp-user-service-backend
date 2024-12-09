import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'

async function deleteScope(request, scopeId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
    const scope = await db
      .collection('scopes')
      .findOne({ _id: ObjectId.createFromHexString(scopeId) })

    // TODO dry up
    const teamPromises = scope.teams.map(
      async (teamId) =>
        await db.collection('teams').findOneAndUpdate(
          { _id: teamId },
          {
            $pull: { scopes: ObjectId.createFromHexString(scopeId) },
            $set: { updatedAt: new Date() }
          },
          {
            upsert: false,
            returnDocument: 'after'
          }
        )
    )

    // TODO dry up
    const userPromises = scope.users.map(
      async (userId) =>
        await db.collection('users').findOneAndUpdate(
          { _id: userId },
          {
            $pull: { scopes: ObjectId.createFromHexString(scopeId) },
            $set: { updatedAt: new Date() }
          },
          {
            upsert: false,
            returnDocument: 'after'
          }
        )
    )

    await Promise.all(teamPromises)
    await Promise.all(userPromises)

    return await db
      .collection('scopes')
      .findOneAndDelete({ _id: ObjectId.createFromHexString(scopeId) })
  })
}

export { deleteScope }
