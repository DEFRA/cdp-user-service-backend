import Joi from 'joi'

import { deleteTeam } from '../../../helpers/mongo/transactions/delete-transactions.js'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

const deleteTeamController = {
  options: {
    validate: {
      params: Joi.object({
        teamId: teamIdValidation
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    await deleteTeam(request, request.params.teamId)
    return h.response().code(statusCodes.ok)
  }
}

export { deleteTeamController }
