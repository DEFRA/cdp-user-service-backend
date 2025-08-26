import Boom from '@hapi/boom'

import { getScope } from './get-scope.js'
import { getUser } from '../../users/helpers/get-user.js'
import { addScopeToUserTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'

export async function addScopeToUser({
  request,
  userId,
  scopeId,
  startDate,
  endDate
}) {
  const dbUser = await getUser(request.db, userId)
  const dbScope = await getScope(request.db, scopeId)

  if (!dbUser) {
    throw Boom.notFound('User not found')
  }

  if (startDate && endDate && startDate.getTime() >= endDate.getTime()) {
    throw Boom.badRequest('Start date must be before End date')
  }

  if (!dbScope) {
    throw Boom.notFound('Scope not found')
  }

  if (!dbScope.kind.includes('user')) {
    throw Boom.badRequest('Scope cannot be applied to a user')
  }

  if (
    dbUser.scopes.filter((userScope) => {
      const now = new Date()

      // scopeId from db is an ObjectId, so we check for its string against the ObjectId string passed to the endpoint
      const userHasActiveScope =
        userScope.scopeId.toHexString() === scopeId &&
        new Date(userScope.startDate) <= now &&
        new Date(userScope.endDate) >= now // active scope
      const userHasScope = userScope.scopeId.toHexString() === scopeId

      return userHasActiveScope || userHasScope
    }).length > 0
  ) {
    throw Boom.badRequest('User already has this scope assigned')
  }

  return await addScopeToUserTransaction({
    request,
    userId,
    userName: dbUser.name,
    scopeId,
    scopeName: dbScope.value,
    startDate,
    endDate
  })
}
