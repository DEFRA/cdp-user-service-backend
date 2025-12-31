import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  userIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { revokePermissionFromUser } from '../../../permissions/helpers/relationships/relationships.js'

const adminRemoveScopeFromUserController = {
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
        scopeId: Joi.string().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const scopeId = request.params.scopeId
    const scope = await revokePermissionFromUser(request.db, userId, scopeId)
    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminRemoveScopeFromUserController }
