import { getTeams } from '~/src/api/teams/helpers/mongo/get-teams.js'
import { config } from '~/src/config/index.js'

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
    const customGroups = teamsWithGithub
      .map((team) => team.customGroups)
      .flat()
      .filter(Boolean)

    const scopes = jwtScopes.slice().filter((group) => teamIds.includes(group))

    scopes.push(...customGroups)

    const isAdmin = scopes.includes(config.get('oidcAdminGroupId'))
    if (isAdmin) {
      scopes.push('admin')
    }

    const isTenant = await isUserInAServiceTeam(teamIds, scopes)
    if (isTenant) {
      scopes.push('tenant')
    }

    return h
      .response({
        message: 'success',
        scopes,
        scopeFlags: {
          isAdmin,
          isTenant
        }
      })
      .code(200)
  }
}

export { getScopesForUserController }
