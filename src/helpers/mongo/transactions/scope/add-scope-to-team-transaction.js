import { ObjectId } from 'mongodb'
import { UTCDate } from '@date-fns/utc'

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
    await addScopeToTeam({ db, teamId, scopeId, scopeName })
    await addTeamToScope({ db, teamId, teamName, scopeId })
    return addScopeToTeamUsers({ db, teamId, scopeId, scopeName })
  })
}

function addScopeToTeamUsers({ db, teamId, scopeId, scopeName }) {
  return db.collection('users').updateMany(
    { teams: teamId },
    {
      $addToSet: {
        scopes: {
          scopeId: new ObjectId(scopeId),
          scopeName
        }
      },
      $set: { updatedAt: new UTCDate() }
    }
  )
}

function addScopeToTeam({ db, teamId, scopeId, scopeName }) {
  return db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $addToSet: { scopes: { scopeId: new ObjectId(scopeId), scopeName } },
      $set: { updatedAt: new UTCDate() }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

function addTeamToScope({ db, teamId, teamName, scopeId }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { teams: { teamId, teamName } },
      $set: { updatedAt: new UTCDate() }
    }
  )
}

export { addScopeToTeamTransaction }
