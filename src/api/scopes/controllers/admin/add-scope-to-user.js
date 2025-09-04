import Boom from '@hapi/boom'
import {
  statusCodes,
  userIdValidation,
  scopes
} from '@defra/cdp-validation-kit'

import Joi from '../../../../helpers/extended-joi.js'
import { addScopeToUser } from '../../helpers/add-scope-to-user.js'

const adminAddScopeToUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
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
    const params = request.params
    const userId = params.userId
    const scopeId = params.scopeId

    const scope = await addScopeToUser({
      request,
      userId,
      scopeId
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminAddScopeToUserController }
