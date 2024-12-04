import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'

async function deleteScope(request, scopeId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
    const scope = await db
      .collection('scopes')
      .findOne({ _id: new ObjectId(scopeId) })

    const teamPromises = scope.teams.map(
      async (teamId) =>
        await db.collection('teams').findOneAndUpdate(
          { _id: teamId },
          {
            $pull: { scopes: new ObjectId(scopeId) },
            $set: { updatedAt: new Date() }
          },
          {
            upsert: false,
            returnDocument: 'after'
          }
        )
    )

    await Promise.all(teamPromises)

    return await db
      .collection('scopes')
      .findOneAndDelete({ _id: new ObjectId(scopeId) })
  })
}

export { deleteScope }
