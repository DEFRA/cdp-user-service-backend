import { isPast, isFuture } from 'date-fns'
import { scopes } from '@defra/cdp-validation-kit'

import { getUser } from '../../users/helpers/get-user.js'

function includeValidScopes({ startDate, endDate }) {
  const withoutDates = startDate === undefined && endDate === undefined
  const isActive = isPast(startDate) && isFuture(endDate)

  return withoutDates || isActive
}

async function scopesForUser(credentials, db) {
  const scopeList = new Set()

  const userId = credentials.id
  const user = await getUser(db, userId)
/*
  user.relationships.forEach((r) => {
    switch (r.relation) {
      case 'member':
        scopeList.add(`team:${r.object}`)
        scopeList.add(`${scopes.serviceOwner}:team:${r.object}`)
        break
      case 'granted':
        scopeList.add(`permission:${r.object}`)
        break
      case 'breakglass':
        scopeList.add(`permission:${r.object}:team:${r.object}`)
        break
    }
  })*/

  // user assigned scopes
  if (user) {
    scopeList.add(`user:${userId}`)

    const validUserScopes = user.scopes.filter(includeValidScopes)
    for (const scope of validUserScopes) {
      if (scope.teamId) {
        scopeList.add(`permission:${scope.scopeName}:team:${scope.teamId}`)
      } else {
        scopeList.add(`permission:${scope.scopeName}`)
      }
    }
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
