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
      if (s.teamId !== undefined && s.endDate >= new Date()) {
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

  /*
  TODO Speak to phil about - Going back to what I mentioned about scopes this means we get to use the built-in
    hapi auth access control

  // Formats:
  user:<userId>
  team:<teamId>
  permission:<scopeId>
  team:<teamId>:permission:<scopeId>


  // My scopes would become:
  'user:62bb35d2-d4f2-4cf6-abd3-262d99727677',
  'team:aabe63e7-87ef-4beb-a596-c810631fc474',
  'permission:admin',
  'permission:externalTest',
  'permission:restrictedTechMaintenance',
  'permission:restrictedTechPostgres'
  'permission:canGrantProdAccess:team:aabe63e7-87ef-4beb-a596-c810631fc474',
  'permission:serviceOwner:team:aabe63e7-87ef-4beb-a596-c810631fc474'

  Then in routes we can do:

  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [
          'permission:admin',
          'team:{payload.teamId}',
          'permission:canGrantProdAccess:team:{payload.teamId}'
        ]
      }
    },
  }
   */

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
