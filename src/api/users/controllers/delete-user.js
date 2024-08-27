import Joi from 'joi'
import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { deleteUser } from '~/src/api/helpers/mongo/transactions/delete-transactions.js'
import { removeUserFromAadGroup } from '~/src/api/teams/helpers/remove-user-from-aad-group.js'

const deleteUserController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    try {
      const userId = request.params?.userId
      const user = await deleteUser(request, userId)
      if (user.teams?.length) {
        const removeFromAad = user.teams.map((team) =>
          removeUserFromAadGroup(
            request.msGraph,
            team.teamId,
            userId,
            request.logger
          )
        )

        await Promise.all(removeFromAad)
      }

      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      if (error.isBoom) {
        return error
      }

      return Boom.notImplemented('Something went wrong. User not deleted!')
    }
  }
}

export { deleteUserController }
