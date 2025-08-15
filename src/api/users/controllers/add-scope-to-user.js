import Boom from '@hapi/boom'

import Joi from '../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
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
      payload: Joi.object({
        teamId: teamIdValidation.optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional()
      }).optional(),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const scopeId = request.params.scopeId
    const teamId = request.payload?.teamId
    const startDate = request.payload?.startDate
    const endDate = request.payload?.endDate

    const scope = await addScopeToUser({
      request,
      userId,
      scopeId,
      teamId,
      startDate,
      endDate
    })

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { addScopeToUserController }
