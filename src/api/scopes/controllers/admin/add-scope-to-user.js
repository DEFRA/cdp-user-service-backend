import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  statusCodes,
  userIdValidation,
  scopes
} from '@defra/cdp-validation-kit'

import { grantPermissionToUser } from '../../../permissions/helpers/relationships/relationships.js'
import { userScopeIdValidation } from '../../helpers/schemas.js'
import { getUser } from '../../../users/helpers/get-user.js'

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
        scopeId: userScopeIdValidation.required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const params = request.params
    const userId = params.userId
    const scopeId = params.scopeId

    const dbUser = await getUser(request.db, userId)
    if (!dbUser) {
      throw Boom.notFound('User not found')
    }

    const scope = await grantPermissionToUser(request.db, userId, scopeId)
    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminAddScopeToUserController }
