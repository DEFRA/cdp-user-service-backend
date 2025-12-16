import { withMongoTransaction } from '../with-mongo-transaction.js'

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
      $addToSet: { scopes: { scopeId, scopeName } },
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
    { scopeId },
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
          scopeId,
          scopeName
        }
      },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export { addScopeToTeamTransaction }
