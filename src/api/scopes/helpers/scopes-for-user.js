import { config } from '~/src/config/config.js'
import { getUser } from '~/src/api/users/helpers/get-user.js'
import { getTeams } from '~/src/api/teams/helpers/get-teams.js'
import { isUserInATenantTeam } from '~/src/helpers/user/is-user-in-a-tenant-team.js'

async function scopesForUser(credentials, db) {
  const jwtScopes = credentials.scope
  const adminGroupId = config.get('oidcAdminGroupId')

  const userId = credentials.id
  const user = await getUser(db, userId)
  const userScopes = user?.scopes.map((scope) => scope.value) ?? []

  const allTeamsWithGithub = await getTeams(db)
  const allTeamIds = allTeamsWithGithub.map((team) => team.teamId)

  const scopes = jwtScopes.filter((group) => allTeamIds.includes(group))

  const teamScopes = new Set(
    allTeamsWithGithub
      .filter((team) => scopes.includes(team.teamId))
      .map((team) => team.scopes.map((scope) => scope.value))
      .flat()
      .filter(Boolean)
  )

  scopes.push(...userScopes, ...teamScopes)

  if (userId) {
    scopes.push(userId)
  }

  const isAdmin = scopes.includes(adminGroupId)
  if (isAdmin) {
    scopes.push('admin')
  }

  const isTenant = isUserInATenantTeam(allTeamIds, scopes, adminGroupId)
  if (isTenant) {
    scopes.push('tenant')
  }

  return {
    scopes: Array.from(new Set(scopes)),
    scopeFlags: {
      isAdmin,
      isTenant
    }
  }
}

export { scopesForUser }
