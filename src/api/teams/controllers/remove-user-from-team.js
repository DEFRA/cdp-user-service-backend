import { config } from '~/src/config/config.js'
import { removeUserFromTeam } from '~/src/helpers/mongo/transactions/delete-transactions.js'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group.js'

const removeUserFromTeamController = {
  options: {
    tags: ['api', 'teams'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId

    const team = await removeUserFromTeam(request, userId, teamId)
    await removeUserFromAadGroup(
      request.msGraph,
      teamId,
      userId,
      request.logger
    )
    return h.response({ message: 'success', team }).code(200)
  }
}

export { removeUserFromTeamController }
