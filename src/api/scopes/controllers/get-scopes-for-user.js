import { config } from '~/src/config/config.js'
import { getTeams } from '~/src/api/teams/helpers/get-teams.js'
import { getUser } from '~/src/api/users/helpers/get-user.js'

function isUserInAServiceTeam(teamIds, userGroups) {
  return userGroups
    .filter((group) => group !== config.get('oidcAdminGroupId'))
    .some((userGroupId) => teamIds?.includes(userGroupId))
}

const getScopesForUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials
    const jwtScopes = credentials.scope

    const userId = credentials.id
    const user = await getUser(request.db, userId)
    const userScopes = user?.scopes.map((scope) => scope.value) ?? []

    const allTeamsWithGithub = await getTeams(request.db, request.query)
    const allTeamIds = allTeamsWithGithub.map((team) => team.teamId)

    const scopes = jwtScopes
      .slice()
      .filter((group) => allTeamIds.includes(group))

    const teamScopes = new Set(
      allTeamsWithGithub
        .filter((team) => scopes.includes(team.teamId))
        .map((team) => team.scopes.map((scope) => scope.value))
        .flat()
        .filter(Boolean)
    )

    scopes.push(...userScopes, ...teamScopes)

    const isAdmin = scopes.includes(config.get('oidcAdminGroupId'))
    if (isAdmin) {
      scopes.push('admin')
    }

    const isTenant = isUserInAServiceTeam(allTeamIds, scopes)
    if (isTenant) {
      scopes.push('tenant')
    }

    return h
      .response({
        message: 'success',
        scopes: Array.from(new Set(scopes)),
        scopeFlags: {
          isAdmin,
          isTenant
        }
      })
      .code(200)
  }
}

export { getScopesForUserController }
