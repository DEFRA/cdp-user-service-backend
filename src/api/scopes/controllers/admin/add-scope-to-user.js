import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { userIdValidation } from '@defra/cdp-validation-kit'
import { addScopeToUser } from '../../helpers/add-scope-to-user.js'

const adminAddScopeToUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
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

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminAddScopeToUserController }
