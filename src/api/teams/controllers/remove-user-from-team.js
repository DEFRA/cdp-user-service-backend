import { scopes, statusCodes } from '@defra/cdp-validation-kit'
import { removeUserFromTeamTransaction } from '../../../helpers/mongo/transactions/team/remove-user-from-team-transaction.js'

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

    const team = await removeUserFromTeamTransaction({
      request,
      userId,
      teamId
    })

    return h.response(team).code(statusCodes.ok)
  }
}

export { removeUserFromTeamController }
