import { scopes, statusCodes } from '@defra/cdp-validation-kit'
import { removeUserFromTeam } from '../../permissions/helpers/relationships/relationships.js'
import { getTeam } from '../helpers/get-team.js'

const removeUserFromTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId
    await removeUserFromTeam(request.db, userId, teamId)

    const team = await getTeam(request.db, teamId)
    return h.response(team).code(statusCodes.ok)
  }
}

export { removeUserFromTeamController }
