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
    const teamsWithGithub = await getTeams(request.db, request.query)
    const teamIds = teamsWithGithub?.map((team) => team.teamId)
    const teamScopes = teamsWithGithub
      .map((team) => team.scopes)
      .flat()
      .filter(Boolean)

    const scopes = jwtScopes.slice().filter((group) => teamIds.includes(group))

    scopes.push(...teamScopes)

    const isAdmin = scopes.includes(config.get('oidcAdminGroupId'))
    if (isAdmin) {
      scopes.push('admin')
    }

    const isTenant = isUserInAServiceTeam(teamIds, scopes)
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
