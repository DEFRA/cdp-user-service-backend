import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  scopes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import { removeScopeFromMemberTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-member-transaction.js'

const adminRemoveScopeFromMemberController = {
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
        scopeId: Joi.string().required(),
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

    const scope = await removeScopeFromMemberTransaction({
      request,
      userId,
      scopeId,
      teamId
    })
    return h.response(scope).code(200)
  }
}

export { adminRemoveScopeFromMemberController }
