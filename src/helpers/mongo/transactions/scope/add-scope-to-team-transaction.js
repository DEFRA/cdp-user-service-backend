import { withMongoTransaction } from '../with-mongo-transaction.js'
import { maybeObjectId } from '../../../maybe-objectid.js'

async function addScopeToTeamTransaction({
  request,
  teamId,
  teamName,
  scopeId,
  scopeName
}) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await addScopeToTeam({ db, session, teamId, scopeId, scopeName })
    await addTeamToScope({ db, session, teamId, teamName, scopeId })
    return addScopeToTeamUsers({ db, session, teamId, scopeId, scopeName })
  })
}

function addScopeToTeam({ db, session, teamId, scopeId, scopeName }) {
  return db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $addToSet: { scopes: { scopeId: maybeObjectId(scopeId), scopeName } },
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

function addTeamToScope({ db, session, teamId, teamName, scopeId }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: maybeObjectId(scopeId) },
    {
      $addToSet: { teams: { teamId, teamName } },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

function addScopeToTeamUsers({ db, session, teamId, scopeId, scopeName }) {
  return db.collection('users').updateMany(
    { teams: teamId },
    {
      $addToSet: {
        scopes: {
          scopeId: maybeObjectId(scopeId),
          scopeName
        }
      },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export { addScopeToTeamTransaction }
