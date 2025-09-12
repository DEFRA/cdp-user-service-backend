import { withMongoTransaction } from '../with-mongo-transaction.js'

async function addUserToTeamTransaction(request, userId, teamId) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await addTeamToUser({ db, session, teamId, userId })
    await addTeamScopesToUsers({ db, session, teamId, userId })

    return addUserToTeam({ db, session, teamId, userId })
  })
}

function addUserToTeam({ db, session, teamId, userId }) {
  return db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $addToSet: { users: userId },
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

async function addTeamScopesToUsers({ db, session, teamId, userId }) {
  const team = await db
    .collection('teams')
    .findOne({ _id: teamId }, { projection: { scopes: 1, teamName: 1 } })

  if (team?.scopes?.length) {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { scopes: { $each: team.scopes } },
        $currentDate: { updatedAt: true }
      },
      { session }
    )
  }
}

function addTeamToUser({ db, session, teamId, userId }) {
  return db.collection('users').findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: { teams: teamId },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export { addUserToTeamTransaction }
