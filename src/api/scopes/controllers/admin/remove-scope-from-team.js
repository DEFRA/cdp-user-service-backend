import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { removeScopeFromTeamTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-team-transaction.js'
import { teamIdValidation } from '@defra/cdp-validation-kit'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const adminRemoveScopeFromTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    },
    validate: {
      params: Joi.object({
        teamId: teamIdValidation,
        scopeId: Joi.objectId().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const scopeId = request.params.scopeId

    const scope = await removeScopeFromTeamTransaction(request, teamId, scopeId)
    return h.response({ message: 'success', scope }).code(statusCodes.ok)
  }
}

export { adminRemoveScopeFromTeamController }
