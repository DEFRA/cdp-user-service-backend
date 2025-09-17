import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function removeScopeFromTeamTransaction({
  request,
  teamId,
  teamName,
  scopeId,
  scopeName
}) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await removeScopeFromTeam({ db, session, teamId, scopeId, scopeName })

    return removeTeamFromScopeTeams({
      db,
      session,
      teamId,
      teamName,
      scopeId
    })
  })
}

async function removeScopeFromTeam({
  db,
  session,
  teamId,
  scopeId,
  scopeName
}) {
  await db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $pull: {
        scopes: {
          scopeId: new ObjectId(scopeId),
          scopeName
        }
      },
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )

  return removeScopeFromTeamUsers({ db, session, teamId, scopeId })
}

function removeScopeFromTeamUsers({ db, session, teamId, scopeId }) {
  return db.collection('users').updateMany(
    { teams: teamId },
    {
      $pull: {
        scopes: { scopeId: new ObjectId(scopeId) }
      },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

function removeTeamFromScopeTeams({ db, session, teamId, teamName, scopeId }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { teams: { teamId, teamName } },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export {
  removeScopeFromTeamTransaction,
  removeTeamFromScopeTeams,
  removeScopeFromTeam
}
