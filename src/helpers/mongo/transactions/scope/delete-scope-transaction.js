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
    for (const team of scope.teams) {
      await removeScopeFromTeam({
        db,
        session,
        teamId: team.teamId,
        scopeId,
        scopeName: scope.value
      })
    }

    // Remove scope from users
    for (const user of scope.users) {
      await removeScopeFromUser({ db, session, scopeId, userId: user.userId })
    }

    // Remove scope from members
    for (const member of scope.members) {
      await removeScopeFromUsers({
        db,
        session,
        scopeId,
        userId: member.userId
      })
    }

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
