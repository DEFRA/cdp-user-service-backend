import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { removeScopeFromUserTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-user-transaction.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'

const adminRemoveScopeFromUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', 'testAsTenant']
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation,
        scopeId: Joi.objectId().required()
      }),
      payload: Joi.object({
        teamId: teamIdValidation.optional()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const scopeId = request.params.scopeId
    const teamId = request.payload?.teamId

    const scope = await removeScopeFromUserTransaction(
      request,
      userId,
      scopeId,
      teamId
    )
    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminRemoveScopeFromUserController }
