import Boom from '@hapi/boom'

import { getScope } from './get-scope.js'
import { getUser } from '../../users/helpers/get-user.js'
import { addScopeToUserTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'

export async function addScopeToUser({ request, userId, scopeId }) {
  const dbUser = await getUser(request.db, userId)
  const dbScope = await getScope(request.db, scopeId)

  if (!dbUser) {
    throw Boom.notFound('User not found')
  }

  if (!dbScope) {
    throw Boom.notFound('Scope not found')
  }

  if (!dbScope.kind.includes('user')) {
    throw Boom.badRequest('Scope cannot be applied to a user')
  }

  if (
    dbUser.scopes?.filter((userScope) => {
      const userHasScope = userScope.scopeId?.toHexString() === scopeId

      return userHasScope
    }).length > 0
  ) {
    throw Boom.badRequest('User already has this scope assigned')
  }

  return addScopeToUserTransaction({
    request,
    userId,
    userName: dbUser.name,
    scopeId,
    scopeName: dbScope.value
  })
}
