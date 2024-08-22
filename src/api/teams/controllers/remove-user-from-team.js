import { removeUserFromTeam } from '~/src/api/helpers/mongo/transactions/delete-transactions'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group'
import { config } from '~/src/config'

const removeUserFromTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.oidcAdminGroupId, '{params.teamId}']
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
