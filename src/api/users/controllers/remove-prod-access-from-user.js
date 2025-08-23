import Boom from '@hapi/boom'

import Joi from '../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
import { getScope } from '../../scopes/helpers/get-scope.js'
import { removeScopeFromUserTransaction } from '../../../helpers/mongo/transactions/scope/remove-scope-from-user-transaction.js'

const removeProdAccessFromUserController = {
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
        endAt: Joi.date().iso().optional()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const teamId = request.payload?.teamId

    const prodAccessScope = await getScope(request.db, 'prodAccess')

    // FIXME check that the request.user has permission to add prod access for this team

    const scope = await removeScopeFromUserTransaction(
      request,
      userId,
      prodAccessScope.id,
      teamId
    )

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { removeProdAccessFromUserController }
