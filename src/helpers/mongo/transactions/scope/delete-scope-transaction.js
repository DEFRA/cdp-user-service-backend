import Boom from '@hapi/boom'
import { ObjectId } from 'mongodb'

import { getScope } from '../../../../api/scopes/helpers/get-scope.js'
import { withMongoTransaction } from '../with-mongo-transaction.js'
import { removeScopeFromTeam } from './remove-scope-from-team-transaction.js'
import {
  removeScopeFromUser,
  removeScopeFromUsers
} from '../remove-transaction-helpers.js'

async function deleteScopeTransaction({ request, scopeId }) {
  const scope = await getScope(request.db, scopeId)

  if (!scope) {
    throw Boom.notFound('Scope not found')
  }

  const mongoTransaction = withMongoTransaction(request)

  await mongoTransaction(async ({ db, session }) => {
    // Remove scope from teams
    const scopeTeamsPromises = scope.teams.map((team) =>
      removeScopeFromTeam({
        db,
        session,
        teamId: team.teamId,
        scopeId,
        scopeName: scope.value
      })
    )
    await Promise.all(scopeTeamsPromises)

    // Remove scope from users
    const scopeUsersPromises = scope.users.map((user) =>
      removeScopeFromUser({ db, session, scopeId, userId: user.userId })
    )
    await Promise.all(scopeUsersPromises)

    // Remove scope from members
    const scopeMembersPromises = scope.members.map((member) =>
      removeScopeFromUsers({
        db,
        session,
        scopeId,
        userId: member.userId
      })
    )
    await Promise.all(scopeMembersPromises)

    // Remove any left-over scopes from users. For instance scopes assigned due to team membership
    await removeScopeFromUsers({ db, session, scopeId })

    const { deletedCount } = await db
      .collection('scopes')
      .deleteOne({ _id: new ObjectId(scopeId) }, { session })

    if (deletedCount === 1) {
      request.logger.info(`Scope ${scope.value} deleted from CDP`)
    }
  })

  return scope
}

export { deleteScopeTransaction }
