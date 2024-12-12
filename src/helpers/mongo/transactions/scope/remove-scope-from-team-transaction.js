import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'

async function removeScopeFromTeamTransaction(request, teamId, scopeId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await removeScopeFromTeam(db, scopeId, teamId)
    return await removeTeamFromScope(db, teamId, scopeId)
  })
}

function removeScopeFromTeam(db, scopeId, teamId) {
  return db.collection('teams').findOneAndUpdate(
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
}

function removeTeamFromScope(db, teamId, scopeId) {
  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $pull: { teams: teamId }, $set: { updatedAt: new Date() } }
    )
}

export {
  removeScopeFromTeamTransaction,
  removeTeamFromScope,
  removeScopeFromTeam
}
