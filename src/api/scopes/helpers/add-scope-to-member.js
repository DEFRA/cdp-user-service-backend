import Boom from '@hapi/boom'
import { UTCDate } from '@date-fns/utc'

import { getScope } from './get-scope.js'
import { getUser } from '../../users/helpers/get-user.js'
import { getTeam } from '../../teams/helpers/get-team.js'
import { addScopeToMemberTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-member-transaction.js'

export async function addScopeToMember({
  request,
  userId,
  scopeId,
  teamId,
  startDate,
  endDate,
  requestor,
  reason
}) {
  const dbUser = await getUser(request.db, userId)
  const dbScope = await getScope(request.db, scopeId)

  if (!dbUser) {
    throw Boom.notFound('User not found')
  }

  const team = await getTeam(request.db, teamId)
  if (!team) {
    throw Boom.notFound('Team not found')
  }
  if (dbUser.teams?.filter((t) => t.teamId === teamId).length === 0) {
    throw Boom.badRequest('User is not a member of the team')
  }

  if (startDate && endDate && startDate.getTime() >= endDate.getTime()) {
    throw Boom.badRequest('Start date must be before End date')
  }

  if (!dbScope) {
    throw Boom.notFound('Scope not found')
  }

  if (!dbScope.kind.includes('member')) {
    throw Boom.badRequest('Scope cannot be applied to a team member')
  }

  if (
    dbUser.scopes?.filter((scope) => {
      const utcDateNow = new UTCDate()
      const hasActiveDateBasedScope =
        scope.scopeId.toHexString() === scopeId &&
        teamId !== undefined &&
        scope.teamId === teamId &&
        scope.startDate <= utcDateNow &&
        scope.endDate >= utcDateNow

      const hasScope =
        scope.scopeId.toHexString() === scopeId &&
        teamId !== undefined &&
        scope.teamId === teamId &&
        scope.startDate === undefined &&
        startDate === undefined &&
        scope.endDate === undefined &&
        endDate === undefined

      return hasScope || hasActiveDateBasedScope
    }).length > 0
  ) {
    throw Boom.badRequest('Team member already has this scope assigned')
  }

  return addScopeToMemberTransaction({
    request,
    userId,
    userName: dbUser.name,
    scopeId,
    scopeName: dbScope.value,
    teamId,
    teamName: team.name,
    startDate,
    endDate,
    requestor,
    reason
  })
}
