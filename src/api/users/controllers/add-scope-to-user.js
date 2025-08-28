import Boom from '@hapi/boom'

import Joi from '../../../helpers/extended-joi.js'
import { userIdValidation } from '@defra/cdp-validation-kit'
import { addScopeToUser } from '../../scopes/helpers/add-scope-to-user.js'

const addScopeToUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin'] // FIXME: look at interrogating teamScopes: https://hapi.dev/api/?v=21.4.3#route.options.auth.access.scope
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

    const payload = request.payload
    const teamId = payload.teamId

    const scope = await addScopeToUser({
      request,
      userId,
      scopeId,
      teamId
    })

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { addScopeToUserController }
