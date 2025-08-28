import Boom from '@hapi/boom'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'

import Joi from '../../../helpers/extended-joi.js'
import { getScope } from '../../scopes/helpers/get-scope.js'
import { removeScopeFromMemberTransaction } from '../../../helpers/mongo/transactions/scope/remove-scope-from-member-transaction.js'
import { getScopeByName } from '../../scopes/helpers/get-scope-by-name.js'

const removeProdAccessFromMemberController = {
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
        userId: userIdValidation,
        teamId: teamIdValidation
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const params = request.params
    const userId = params.userId
    const teamId = params.teamId

    // FIXME - reference scope from package
    const prodAccessScope = await getScopeByName(request.db, 'prodAccess')

    // FIXME check that the request.user has permission to add prod access for this team

    const scope = await removeScopeFromMemberTransaction(
      request,
      userId,
      prodAccessScope?.scopeId?.toHexString(),
      teamId
    )

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { removeProdAccessFromMemberController }
