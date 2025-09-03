import { ObjectId } from 'mongodb'
import { UTCDate } from '@date-fns/utc'

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
    return removeTeamFromScope({ db, teamId, teamName, scopeId })
  })
}

async function removeScopeFromTeam({ db, teamId, scopeId, scopeName }) {
  const utcDateNow = new UTCDate()

  await db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $pull: {
        scopes: {
          scopeId: new ObjectId(scopeId),
          scopeName,
          startDate: { $exists: false },
          endDate: { $exists: false }
        }
      },
      $set: { updatedAt: utcDateNow }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )

  return removeScopeFromTeamUsers({ db, teamId, scopeId })
}

function removeScopeFromTeamUsers({ db, teamId, scopeId }) {
  return db.collection('users').updateMany(
    { teams: teamId },
    {
      $pull: {
        scopes: {
          scopeId: new ObjectId(scopeId),
          startDate: { $exists: false },
          endDate: { $exists: false }
        }
      },
      $set: { updatedAt: new UTCDate() }
    }
  )
}

function removeTeamFromScope({ db, teamId, teamName, scopeId }) {
  const utcDateNow = new UTCDate()

  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { teams: { teamId, teamName } },
      $set: { updatedAt: utcDateNow }
    }
  )
}

export {
  removeScopeFromTeamTransaction,
  removeTeamFromScope,
  removeScopeFromTeam
}
