import { scopes, statusCodes } from '@defra/cdp-validation-kit'

import { removeUserFromTeam } from '../../../helpers/mongo/transactions/delete-transactions.js'

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

    const team = await removeUserFromTeam(request, userId, teamId)
    return h.response(team).code(statusCodes.ok)
  }
}

export { removeUserFromTeamController }
