import { UTCDate } from '@date-fns/utc'
import { withMongoTransaction } from './with-mongo-transaction.js'

async function addUserToTeam(request, userId, teamId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    const utcDateNow = new UTCDate()

    await addTeamToUser({ db, teamId, userId, utcDateNow })
    await addTeamScopesToUsers({ db, teamId, userId, utcDateNow })

    return await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        $addToSet: { users: userId },
        $set: { updatedAt: utcDateNow }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
  })
}

async function addTeamScopesToUsers({ db, teamId, userId, utcDateNow }) {
  const team = await db
    .collection('teams')
    .findOne({ _id: teamId }, { projection: { scopes: 1, teamName: 1 } })

  if (team?.scopes?.length) {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: {
            $each: team.scopes.map((scope) => ({
              ...scope
            }))
          }
        },
        $set: { updatedAt: utcDateNow }
      }
    )
  }
}

function addTeamToUser({ db, teamId, userId, utcDateNow }) {
  return db
    .collection('users')
    .findOneAndUpdate(
      { _id: userId },
      { $addToSet: { teams: teamId }, $set: { updatedAt: utcDateNow } }
    )
}

export { addUserToTeam }
