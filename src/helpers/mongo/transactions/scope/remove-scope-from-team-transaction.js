import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function removeScopeFromTeamTransaction({
  request,
  teamId,
  teamName,
  scopeId,
  scopeName
}) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await removeScopeFromTeam({ db, teamId, scopeId, scopeName })
    return await removeTeamFromScope({ db, teamId, teamName, scopeId })
  })
}

function removeScopeFromTeam({ db, teamId, scopeId, scopeName }) {
  return db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $pull: { scopes: { scopeId: new ObjectId(scopeId), scopeName } },
      $set: { updatedAt: new Date() }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

function removeTeamFromScope({ db, teamId, teamName, scopeId }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { teams: { teamId, teamName } },
      $set: { updatedAt: new Date() }
    }
  )
}

export {
  removeScopeFromTeamTransaction,
  removeTeamFromScope,
  removeScopeFromTeam
}
