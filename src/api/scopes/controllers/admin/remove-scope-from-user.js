import Boom from '@hapi/boom'
import {
  userIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import Joi from '../../../../helpers/extended-joi.js'
import { removeScopeFromUserTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-user-transaction.js'

const adminRemoveScopeFromUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, scopes.testAsTenant]
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation,
        scopeId: Joi.objectId().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const scopeId = request.params.scopeId

    const scope = await removeScopeFromUserTransaction({
      request,
      userId,
      scopeId
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminRemoveScopeFromUserController }
