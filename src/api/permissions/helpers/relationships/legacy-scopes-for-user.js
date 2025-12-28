import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'

async function getLegacyScopesForUser(db, userId) {
  const now = new Date()
  const activeWindow = {
    $and: [
      {
        $or: [
          { start: { $lte: now } },
          { start: null },
          { start: { $exists: false } }
        ]
      },
      {
        $or: [
          { end: { $gte: now } },
          { end: null },
          { end: { $exists: false } }
        ]
      }
    ]
  }

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
    // TODO: we need to make change up how team scoped breakglass is granted
    if (r.relation === scopeDefinitions.breakGlass.scopeId) {
      // TODO: check expiration
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
      scopeFlags.isTenant = true
      perms.add(scopes.tenant)

      // Inherit the teams permissions
      r.path.forEach((p) => {
        if (p.relation === 'granted') {
          perms.add(`${p.resourceType}:${p.resource}`)
        }
      })
    }
  }

  // If the user is an admin, remove the tenant flag & permission
  if (perms.has(scopes.admin)) {
    scopeFlags.isAdmin = true
    scopeFlags.isTenant = false
    perms.delete(scopes.tenant)
  }

  return {
    scopes: Array.from(perms).sort((a, b) => a.localeCompare(b)),
    scopeFlags
  }
}

export { getLegacyScopesForUser }
