import Joi from 'joi'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { deleteTeamTransaction } from '../../../helpers/mongo/transactions/team/delete-team-transaction.js'

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
    await deleteTeamTransaction({ request, teamId: request.params.teamId })

    return h.response().code(statusCodes.ok)
  }
}

export { deleteTeamController }
