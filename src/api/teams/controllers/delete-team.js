import { deleteTeam } from '~/src/api/helpers/mongo/transactions/delete-transactions.js'
import { config } from '~/src/config/index.js'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group.js'

const deleteTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    const team = await deleteTeam(request, request.params.teamId)

    if (team.users?.length) {
      const removeFromAad = team.users.map((user) =>
        removeUserFromAadGroup(
          request.msGraph,
          team.teamId,
          user.userId,
          request.logger
        )
      )
      await Promise.all(removeFromAad)
    }

    return h.response({ message: 'success' }).code(200)
  }
}

export { deleteTeamController }
