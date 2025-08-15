import Boom from '@hapi/boom'

import Joi from '../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
import { addScopeToUser } from '../../scopes/helpers/add-scope-to-user.js'
import { getScope } from '../../scopes/helpers/get-scope.js'

const addProdAccessToUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', 'canGrantProdAccess'] // FIXME: look at interrogating teamScopes: https://hapi.dev/api/?v=21.4.3#route.options.auth.access.scope
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation
      }),
      payload: Joi.object({
        teamId: teamIdValidation,
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
      }).optional(),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const teamId = request.payload?.teamId
    const startDate = request.payload?.startDate
    const endDate = request.payload?.endDate

    const prodAccessScope = await getScope(request.db, 'prodAccess')

    // FIXME check that the request.user has permission to add prod access for this team

    const scope = await addScopeToUser({
      request,
      userId,
      scopeId: prodAccessScope.id,
      teamId,
      startDate,
      endDate
    })

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { addProdAccessToUserController }
