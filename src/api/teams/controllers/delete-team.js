import Joi from 'joi'

import { deleteTeam } from '../../../helpers/mongo/transactions/delete-transactions.js'
import { teamIdValidation } from '@defra/cdp-validation-kit'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    await deleteTeam(request, request.params.teamId)
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}

export { deleteTeamController }
