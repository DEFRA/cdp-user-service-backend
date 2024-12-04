import Boom from '@hapi/boom'

import { getTeam } from '~/src/api/teams/helpers/mongo/get-team.js'
import { getUser } from '~/src/api/users/helpers/get-user.js'
import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'
import { removeTeamFromScope } from '~/src/helpers/mongo/transactions/remove-team-from-scope.js'

async function removeTeamFromUserDb(db, userId, teamId) {
  return await db.collection('users').findOneAndUpdate(
    { _id: userId },
    { $pull: { teams: teamId }, $set: { updatedAt: new Date() } },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

async function removeUserFromTeamDb(db, userId, teamId) {
  return await db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $pull: { users: userId },
      $set: { updatedAt: new Date() }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

async function removeUserFromTeam(request, userId, teamId) {
  const db = request.db

  await withMongoTransaction(request, async () => {
    await removeTeamFromUserDb(db, userId, teamId)
    await removeUserFromTeamDb(db, userId, teamId)
  })
}

async function deleteUser(request, userId) {
  const db = request.db
  const user = await getUser(db, userId)
  if (!user) {
    throw Boom.notFound('User not found')
  }
  await withMongoTransaction(request, async () => {
    if (user.teams?.length) {
      const removeFromTeams = user.teams.map((team) =>
        removeUserFromTeamDb(db, user.userId, team.teamId)
      )
      await Promise.all(removeFromTeams)
    }
    const { deletedCount } = await db.collection('users').deleteOne({
      _id: userId
    })
    if (deletedCount === 1) {
      request.logger.info(`User ${user.name} deleted from CDP`)
    }
  })

  return user
}

async function deleteTeam(request, teamId) {
  const db = request.db
  const team = await getTeam(db, teamId)
  if (!team) {
    throw Boom.notFound('Team not found')
  }
  await withMongoTransaction(request, async () => {
    if (team.users?.length) {
      const removeFromUsers = team.users.map((user) =>
        removeTeamFromUserDb(db, user.userId, team.teamId)
      )
      await Promise.all(removeFromUsers)
    }

    if (team.scopes?.length) {
      const removeFromScopes = team.scopes.map((scope) =>
        removeTeamFromScope(request, team.teamId, scope.scopeId)
      )
      await Promise.all(removeFromScopes)
    }

    const { deletedCount } = await db.collection('teams').deleteOne({
      _id: teamId
    })

    if (deletedCount === 1) {
      request.logger.info(`Team ${team.name} deleted from CDP`)
    }
  })
  return team
}

export { removeUserFromTeam, deleteUser, deleteTeam }
