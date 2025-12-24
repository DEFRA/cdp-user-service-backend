import Boom from '@hapi/boom'
import {
  scopes,
  statusCodes,
  userIdValidation
} from '@defra/cdp-validation-kit'

import Joi from 'joi'
import { addScopeToUser } from '../../scopes/helpers/add-scope-to-user.js'

const addScopeToUserController = {
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
    // TODO: this seems to be unused, delete?
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

    return h.response(scope).code(statusCodes.ok)
  }
}

export { addScopeToUserController }
