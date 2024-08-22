import { deleteTeam } from '~/src/api/helpers/mongo/transactions/delete-transactions'
import { config } from '~/src/config'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group'

const deleteTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.oidcAdminGroupId]
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
