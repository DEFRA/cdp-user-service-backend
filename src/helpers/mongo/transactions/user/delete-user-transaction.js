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
      const removeFromTeams = user.teams.map((team) =>
        removeUserFromTeam({
          db,
          session,
          userId: user.userId,
          teamId: team.teamId
        })
      )

      await Promise.all(removeFromTeams)
    }

    if (user.scopes?.length) {
      const removeFromScopes = user.scopes.map((scope) => {
        if (scope.teamId) {
          return removeMemberFromScopeMembers({
            db,
            session,
            userId,
            scopeId: scope.scopeId,
            teamId: scope.teamId
          })
        }

        return removeUserFromScope({
          db,
          session,
          userId: user.userId,
          scopeId: scope.scopeId
        })
      })
      await Promise.all(removeFromScopes)
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
