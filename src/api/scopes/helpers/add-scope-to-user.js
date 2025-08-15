import { getUser } from '../../users/helpers/get-user.js'
import { getScope } from './get-scope.js'
import { getTeam } from '../../teams/helpers/get-team.js'
import Boom from '@hapi/boom'
import { addScopeToUserTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'

export async function addScopeToUser({
  request,
  userId,
  scopeId,
  teamId,
  startDate,
  endDate
}) {
  const dbUser = await getUser(request.db, userId)
  const dbScope = await getScope(request.db, scopeId)

  if (!dbUser) {
    throw Boom.notFound('User not found')
  }

  if (teamId) {
    const team = await getTeam(request.db, teamId)
    if (!team) {
      throw Boom.notFound('Team not found')
    }
    if (dbUser.teams.filter((team) => team.id === teamId).length === 0) {
      throw Boom.badRequest('User is not a member of the team')
    }
  }

  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    throw Boom.badRequest('Start date must be before End date')
  }

  if (!dbScope) {
    throw Boom.notFound('Scope not found')
  }

  if (!dbScope.kind.includes('user')) {
    throw Boom.badRequest('Scope cannot be applied to a user')
  }

  if (
    dbUser.scopes.filter(
      (scope) =>
        scope.id === scopeId && (teamId === null || scope.teamId === teamId)
    ).length === 0
  ) {
    throw Boom.badRequest('User already has this scope assigned')
  }

  return await addScopeToUserTransaction({
    request,
    userId,
    scopeId,
    teamId,
    startDate,
    endDate
  })
}
