import Joi from 'joi'

import { deleteTeam } from '~/src/helpers/mongo/transactions/delete-transactions.js'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group.js'

const deleteTeamController = {
  options: {
    tags: ['api', 'teams'],
    validate: {
      params: Joi.object({
        teamId: Joi.string().uuid().required()
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
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
