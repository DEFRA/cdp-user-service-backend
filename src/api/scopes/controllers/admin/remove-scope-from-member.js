import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
import { removeScopeFromMemberTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-member-transaction.js'

const adminRemoveScopeFromMemberController = {
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
        scopeId: Joi.objectId().required(),
        teamId: teamIdValidation
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const params = request.params
    const userId = params.userId
    const scopeId = params.scopeId
    const teamId = params.teamId

    const scope = await removeScopeFromMemberTransaction(
      request,
      userId,
      scopeId,
      teamId
    )
    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminRemoveScopeFromMemberController }
