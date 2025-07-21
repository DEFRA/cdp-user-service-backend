import { getUser } from '../../users/helpers/get-user.js'
import { getTeams } from '../../teams/helpers/get-teams.js'

async function scopesForUser(credentials, db) {
  const adminScope = 'admin'
  const tenantScope = 'tenant'
  const testAsTenantScope = 'testAsTenant'

  const scopes = new Set()

  const userId = credentials.id
  const user = await getUser(db, userId)

  // user level scopes
  if (user) {
    scopes.add(userId)
    user.scopes.forEach((s) => scopes.add(s.value))
  }

  // team level scopes
  if (user?.teams) {
    const allTeamsWithGithub = await getTeams(db)
    const teamLookup = new Map(
      allTeamsWithGithub.map((team) => [team.teamId, team])
    )

    for (const team of user.teams) {
      scopes.add(team.teamId)
      const userTeam = teamLookup.get(team.teamId)
      if (userTeam) {
        userTeam.scopes.forEach((s) => scopes.add(s.value))
      }
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
    }
  }
}

export { scopesForUser }
