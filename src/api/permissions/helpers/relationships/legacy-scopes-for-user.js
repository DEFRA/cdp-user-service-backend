import { scopes } from '@defra/cdp-validation-kit'
import { memberScopeIds, scopeDefinitions } from '../../../../config/scopes.js'
import { activePermissionFilter } from './active-permission-filter.js'

async function scopesForUser(db, userId) {
  const activeWindow = activePermissionFilter()

  const result = await db
    .collection('relationships')
    .aggregate([
      {
        $match: {
          subject: userId,
          subjectType: 'user',
          ...activeWindow
        }
      },
      {
        $graphLookup: {
          from: 'relationships',
          startWith: '$resource',
          connectFromField: 'resource',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5,
          restrictSearchWithMatch: activeWindow
        }
      }
    ])
    .toArray()

  const perms = new Set()
  perms.add(`user:${userId}`)

  const scopeFlags = {
    isAdmin: false,
    isTenant: false,
    hasBreakGlass: false
  }

  for (const r of result) {
    if (memberScopeIds.has(r.relation)) {
      // Handles break-glass and other member level scopes,
      // as these emit a different permission string to normal perms
      perms.add(`permission:${r.relation}:team:${r.resource}`)
    } else if (r.relation === 'granted') {
      // Permissions granted directly to the user
      perms.add(`${r.resourceType}:${r.resource}`)
    } else if (r.relation === 'member') {
      // Team membership/owner scopes.
      perms.add(`team:${r.resource}`)
      perms.add(`permission:serviceOwner:team:${r.resource}`)
      perms.add(scopes.tenant)

      // Add any scopes that the team has to the user.
      r.path.forEach((p) => {
        if (
          p.relation === 'granted' &&
          p.subjectType === 'team' &&
          p.resourceType === 'permission'
        ) {
          perms.add(`${p.resourceType}:${p.resource}`)
        }
      })
    }
  }

  // Set break glass flag
  for (const perm of perms) {
    if (
      perm === scopeDefinitions.breakGlass.scopeId ||
      perm.startsWith(`permission:${scopeDefinitions.breakGlass.scopeId}:team:`)
    ) {
      scopeFlags.hasBreakGlass = true
      break
    }
  }

  // Handle the test-as-tenant flag
  if (perms.has(scopes.testAsTenant)) {
    perms.delete(scopes.admin)
  }

  // If the user is an admin, remove the tenant permission
  // Since this is a display concern, maybe move the logs to PFE?
  if (perms.has(scopes.admin)) {
    scopeFlags.isAdmin = true
    scopeFlags.isTenant = false
    perms.delete(scopes.tenant)
  } else if (perms.has(scopes.tenant)) {
    scopeFlags.isTenant = true
    scopeFlags.isAdmin = false
  }

  return {
    scopes: Array.from(perms).sort((a, b) => a.localeCompare(b)),
    scopeFlags
  }
}

export { scopesForUser }
