import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { createLogger } from '../../../../helpers/logging/logger.js'
import { findRelationshipGraphForUser } from './relationships.js'

const logger = createLogger()

/**
 * Provides a list of all scopes that can be applied to team members
 * @type {Set<string>}
 */
const memberScopeIds = new Set(
  Object.values(scopeDefinitions)
    .filter((s) => s.kind.includes('member'))
    .map((s) => s.scopeId)
)

async function scopesForUser(db, userId) {
  const result = await findRelationshipGraphForUser(db, userId)

  const perms = new Set()
  perms.add(`user:${userId}`)

  const scopeFlags = {
    isAdmin: false,
    isTenant: false,
    hasBreakGlass: false
  }

  for (const r of result) {
    if (r.relation === 'granted') {
      // Permissions granted directly to the user
      perms.add(`${r.resourceType}:${r.resource}`)
      continue
    }

    if (r.relation === 'member') {
      // Team membership/owner scopes.
      perms.add(`team:${r.resource}`)
      perms.add(`${scopes.serviceOwner}:team:${r.resource}`)
      perms.add(scopes.tenant)

      // Add any scopes that the team has to the user.
      r.path.forEach((p) => {
        if (
          p.relation === 'granted' &&
          p.subjectType === 'team' &&
          p.resourceType === 'permission'
        ) {
          perms.add(`permission:${p.resource}`)
        }
      })
      continue
    }

    if (memberScopeIds.has(r.relation)) {
      // Handles break-glass and other member level scopes,
      // as these emit a different permission string to normal perms
      perms.add(`permission:${r.relation}:team:${r.resource}`)
      continue
    }

    logger.info(`Skipping relation ${r.subject}#${r.relation}@${r.resource}`)
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
