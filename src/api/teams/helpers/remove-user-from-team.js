import { getTeam } from '~/src/api/teams/helpers/mongo/get-team'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group'
import { transactionOptions } from '~/src/constants/transaction-options'

async function removeUserFromTeam(request, userId, teamId) {
  const { db, mongoClient, msGraph, logger } = request

  const session = mongoClient.startSession()

  try {
    await session.withTransaction(async () => {
      await removeUserFromAadGroup(msGraph, logger, teamId, userId)

      await db
        .collection('users')
        .updateOne({ _id: userId }, { $pull: { teams: teamId } })

      await db.collection('teams').findOneAndUpdate(
        { _id: teamId },
        {
          $pull: { users: userId },
          $set: { updatedAt: new Date() }
        }
      )

      return await getTeam(db, teamId)
    }, transactionOptions)
  } catch (error) {
    logger.error(
      { error },
      `User removal from team aborted due to: ${error.message}`
    )
    throw error
  } finally {
    await session.endSession()
  }
}

export { removeUserFromTeam }
