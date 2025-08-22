import Joi from 'joi'

import { deleteTeam } from '../../../helpers/mongo/transactions/delete-transactions.js'
import { teamIdValidation } from '@defra/cdp-validation-kit'

const deleteTeamController = {
  options: {
    tags: ['api', 'teams'],
    validate: {
      params: Joi.object({
        teamId: teamIdValidation
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
