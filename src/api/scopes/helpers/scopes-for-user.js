import { UTCDate } from '@date-fns/utc'
import { getUser } from '../../users/helpers/get-user.js'
import { scopes } from '@defra/cdp-validation-kit'

async function scopesForUser(credentials, db) {
  const scopeList = new Set()

  const userId = credentials.id
  const user = await getUser(db, userId)

  const nowUTC = new UTCDate()

  // user assigned scopes
  if (user) {
    scopeList.add(`user:${userId}`)
    user.scopes
      .filter(
        (scope) =>
          (scope.startDate === undefined || scope.startDate <= nowUTC) &&
          (scope.endDate === undefined || scope.endDate >= nowUTC)
      )
      .forEach((scope) => {
        if (scope.teamId !== undefined) {
          scopeList.add(`permission:${scope.scopeName}:team:${scope.teamId}`)
        } else {
          scopeList.add(`permission:${scope.scopeName}`)
        }
      })
  }

  // team assigned scopes
  if (user?.teams) {
    for (const team of user.teams) {
      scopeList.add(`team:${team.teamId}`)
      scopeList.add(`${scopes.serviceOwner}:team:${team.teamId}`)
    }
  }

  if (scopeList.has(scopes.testAsTenant)) {
    scopeList.delete(scopes.admin)
  }

  const isAdmin = scopeList.has(scopes.admin)
  const teamCount = user?.teams?.length ?? 0

  const isTenant = !isAdmin && teamCount > 0
  if (isTenant) {
    scopeList.add(scopes.tenant)
  }

  const hasBreakGlass = user?.hasBreakGlass ?? false

  return {
    scopes: Array.from(scopeList).sort((a, b) => a.localeCompare(b)),
    scopeFlags: {
      isAdmin,
      isTenant,
      hasBreakGlass
    }
  }
}

export { scopesForUser }
