import { getUser } from '../../users/helpers/get-user.js'

function addScopeToTeamScopes(teamScopes, teamId, scopeName) {
  if (teamScopes[teamId] === undefined) {
    teamScopes[teamId] = [scopeName]
  } else if (!teamScopes[teamId].includes(scopeName)) {
    teamScopes[teamId].push(scopeName)
  }
}

async function scopesForUser(credentials, db) {
  const adminScope = 'admin'
  const serviceOwnerScope = 'serviceOwner'
  const tenantScope = 'tenant'
  const testAsTenantScope = 'testAsTenant'

  const scopes = new Set()
  const teamScopes = {}

  const userId = credentials.id
  const user = await getUser(db, userId)

  // user assigned scopes
  if (user) {
    scopes.add(userId)
    user.scopes.forEach((s) => {
      if (s.teamId !== undefined) {
        addScopeToTeamScopes(teamScopes, s.teamId, s.scopeName)
      } else {
        scopes.add(s.scopeName)
      }
    })
  }

  // team assigned scopes
  if (user?.teams) {
    for (const team of user.teams) {
      scopes.add(team.teamId)
      addScopeToTeamScopes(teamScopes, team.teamId, serviceOwnerScope)
    }
  }

  if (scopes.has(testAsTenantScope)) {
    scopes.delete(adminScope)
  }

  const isAdmin = scopes.has(adminScope)
  const teamCount = user?.teams?.length ?? 0

  const isTenant = !isAdmin && teamCount > 0
  if (isTenant) {
    scopes.add(tenantScope)
  }

  return {
    scopes: Array.from(scopes).sort(),
    scopeFlags: {
      isAdmin,
      isTenant
    },
    teamScopes
  }
}

export { scopesForUser }
