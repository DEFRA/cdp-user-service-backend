import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'

async function removeScopeFromTeam(request, teamId, scopeId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
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

    return await db
      .collection('scopes')
      .findOneAndUpdate(
        { _id: new ObjectId(scopeId) },
        { $pull: { teams: teamId }, $set: { updatedAt: new Date() } }
      )
  })
}

export { removeScopeFromTeam }
