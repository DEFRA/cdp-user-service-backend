import { config } from '~/src/config/index.js'
import { getTeams } from '~/src/api/teams/helpers/mongo/get-teams.js'

function isUserInAServiceTeam(teamIds, userGroups) {
  return userGroups
    .filter((group) => group !== config.get('oidcAdminGroupId'))
    .some((userGroupId) => teamIds?.includes(userGroupId))
}

const getScopesForUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const jwtScopes = request.auth.credentials.scope
    const allTeamsWithGithub = await getTeams(request.db, request.query)
    const allTeamIds = allTeamsWithGithub?.map((team) => team.teamId)

    const scopes = jwtScopes
      .slice()
      .filter((group) => allTeamIds.includes(group))

    const teamScopes = allTeamsWithGithub
      .filter((team) => scopes.includes(team.teamId))
      .map((team) => team.scopes)
      .flat()
      .filter(Boolean)

    scopes.push(...teamScopes)

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
