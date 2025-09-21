import Boom from '@hapi/boom'

import { getUser } from '../../../../api/users/helpers/get-user.js'
import { withMongoTransaction } from '../with-mongo-transaction.js'
import { removeMemberFromScopeMembers } from '../scope/remove-scope-from-member-transaction.js'
import {
  removeUserFromScope,
  removeUserFromTeam
} from '../remove-transaction-helpers.js'

async function deleteUserTransaction({ request, userId }) {
  const user = await getUser(request.db, userId)

  if (!user) {
    throw Boom.notFound('User not found')
  }

  const mongoTransaction = withMongoTransaction(request)

  await mongoTransaction(async ({ db, session }) => {
    if (user.teams?.length) {
      for (const { teamId } of user.teams) {
        await removeUserFromTeam({
          db,
          session,
          userId: user.userId,
          teamId
        })
      }
    }

    if (user.scopes?.length) {
      for (const scope of user.scopes) {
        if (scope.teamId) {
          await removeMemberFromScopeMembers({
            db,
            session,
            userId,
            scopeId: scope.scopeId,
            teamId: scope.teamId
          })
        }

        await removeUserFromScope({
          db,
          session,
          userId: user.userId,
          scopeId: scope.scopeId
        })
      }
    }

    const { deletedCount } = await db
      .collection('users')
      .deleteOne({ _id: userId })

    if (deletedCount === 1) {
      request.logger.info(`User ${user.name} deleted from CDP`)
    }
  })

  return user
}

export { deleteUserTransaction }
