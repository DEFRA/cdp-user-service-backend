import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { getUser } from '~/src/api/users/helpers/get-user'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group'
import { transactionOptions } from '~/src/constants/transaction-options'

function throwUserNotFound(user) {
  if (isNull(user)) {
    throw Boom.notFound('User not found')
  }
}

function updateTeamUsers(db, msGraph, logger) {
  const teamsCollection = db.collection('teams')

  return async (teamId, userId) => {
    await removeUserFromAadGroup(msGraph, logger, teamId, userId)

    const team = await teamsCollection.findOneAndUpdate(
      { _id: teamId },
      {
        $pull: { users: userId },
        $set: { updatedAt: new Date() }
      }
    )

    logger.info(`User removed from CDP ${team.name} team`)
  }
}

async function deleteUser(request, userId) {
  const { db, mongoClient, msGraph, logger } = request

  const session = mongoClient.startSession()

  try {
    await session.withTransaction(async () => {
      const user = await getUser(db, userId)
      throwUserNotFound(user)

      const removeUserFromTeam = updateTeamUsers(db, msGraph, logger)
      const cdpTeams = user?.teams ?? []

      if (cdpTeams.length) {
        const removeFromTeams = cdpTeams.map((team) =>
          removeUserFromTeam(team.teamId, user.userId)
        )
        await Promise.all(removeFromTeams)
      }

      const usersCollection = db.collection('users')
      const { deletedCount = 0 } = await usersCollection.deleteOne({
        _id: userId
      })

      if (deletedCount === 1) {
        logger.info('User deleted from CDP')
      }
    }, transactionOptions)
  } catch (error) {
    logger.error({ error }, `User deletion aborted due to: ${error.message}`)
    throw error
  } finally {
    await session.endSession()
  }
}

export { deleteUser }
