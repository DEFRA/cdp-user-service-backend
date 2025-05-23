import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'

async function addScopeToTeamTransaction(request, teamId, scopeId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        $addToSet: { scopes: new ObjectId(scopeId) },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await addTeamToScope(db, teamId, scopeId)
  })
}

function addTeamToScope(db, teamId, scopeId) {
  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $addToSet: { teams: teamId }, $set: { updatedAt: new Date() } }
    )
}

export { addScopeToTeamTransaction }
