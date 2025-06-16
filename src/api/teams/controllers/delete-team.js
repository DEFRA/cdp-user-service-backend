import Joi from 'joi'

import { deleteTeam } from '~/src/helpers/mongo/transactions/delete-transactions.js'

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
    await deleteTeam(request, request.params.teamId)
    return h.response({ message: 'success' }).code(200)
  }
}

export { deleteTeamController }
