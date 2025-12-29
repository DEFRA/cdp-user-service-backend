import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { activePermissionFilter } from './active-permission-filter.js'

async function getLegacyScopesForUser(db, userId) {
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
    if (r.relation === scopeDefinitions.breakGlass.scopeId) {
      perms.add(`permission:breakGlass:team:${r.resource}`)
      scopeFlags.hasBreakGlass = true
    } else if (r.relation === 'granted') {
      // Directly granted permissions
      perms.add(`${r.resourceType}:${r.resource}`)
      if (r.resource === scopeDefinitions.breakGlass.scopeId) {
        scopeFlags.hasBreakGlass = true
      }
    } else if (r.relation === 'member') {
      perms.add(`team:${r.resource}`)
      perms.add(`permission:serviceOwner:team:${r.resource}`)
      perms.add(scopes.tenant)

      // Inherit the teams permissions
      r.path.forEach((p) => {
        if (p.relation === 'granted') {
          perms.add(`${p.resourceType}:${p.resource}`)
        }
      })
    }
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

export { getLegacyScopesForUser }
