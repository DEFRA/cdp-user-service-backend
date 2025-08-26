import Boom from '@hapi/boom'

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
  endDate
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
  if (dbUser.teams.filter((team) => team.teamId === teamId).length === 0) {
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
    dbUser.scopes.filter((teamMemberScope) => {
      const now = new Date()
      const hasScope =
        teamMemberScope.scopeId.toHexString() === scopeId && // scopeId from db is an ObjectId, so we check for its string against the ObjectId string passed to the endpoint
        teamId !== undefined &&
        teamMemberScope.teamId === teamId &&
        new Date(teamMemberScope.startDate) <= now &&
        new Date(teamMemberScope.endDate) >= now // active scope

      return hasScope
    }).length > 0
  ) {
    throw Boom.badRequest('Team member already has this scope assigned')
  }

  return await addScopeToMemberTransaction({
    request,
    userId,
    userName: dbUser.name,
    scopeId,
    scopeName: dbScope.value,
    teamId,
    teamName: team.name,
    startDate,
    endDate
  })
}
