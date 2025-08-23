import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function addScopeToTeamTransaction({
  request,
  teamId,
  teamName,
  scopeId,
  scopeName
}) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        $addToSet: { scopes: { scopeId: new ObjectId(scopeId), scopeName } },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await addTeamToScope(db, { teamId, teamName }, scopeId)
  })
}

function addTeamToScope(db, values, scopeId) {
  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $addToSet: { teams: values }, $set: { updatedAt: new Date() } }
    )
}

export { addScopeToTeamTransaction }
