import { scopes } from '@defra/cdp-validation-kit'

async function getLegacyScopesForUser(db, userId) {
  const result = await db
    .collection('relationships')
    .aggregate([
      {
        $match: {
          subject: userId,
          subjectType: 'user',
          $and: [
            { $or: [{ start: { $gte: new Date() } }, { start: null }] },
            { $or: [{ end: { $gt: new Date() } }, { end: null }] }
          ]
        }
      },
      {
        $graphLookup: {
          from: collection,
          startWith: '$resource',
          connectFromField: 'resource',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5,
          restrictSearchWithMatch: {
            $and: [
              { $or: [{ start: { $gte: new Date() } }, { start: null }] },
              { $or: [{ end: { $gt: new Date() } }, { end: null }] }
            ]
          }
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
    if (r.relation === 'breakglass') {
      // TODO: check expiration?
      perms.add(`${scopes.breakGlass}:${r.resource}`)
      scopeFlags.hasBreakGlass = true
    } else if (r.relation === 'granted') {
      // Directly granted permissions
      perms.add(`${r.resourceType}:${r.resource}`)
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
