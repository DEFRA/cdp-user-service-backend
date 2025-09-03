import Boom from '@hapi/boom'
import {
  teamIdValidation,
  userIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import Joi from '../../../helpers/extended-joi.js'
import { getScopeByName } from '../../scopes/helpers/get-scope-by-name.js'
import { removeScopeFromMemberTransaction } from '../../../helpers/mongo/transactions/scope/remove-scope-from-member-transaction.js'

const removeBreakGlassFromMemberController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [
          scopes.admin,
          `${scopes.canGrantBreakGlass}:team:{params.teamId}`
        ]
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

    const breakGlassScope = await getScopeByName(request.db, 'breakGlass')
    const scope = await removeScopeFromMemberTransaction(
      request,
      userId,
      breakGlassScope?.scopeId?.toHexString(),
      teamId
    )

    return h.response(scope).code(statusCodes.ok)
  }
}

export { removeBreakGlassFromMemberController }
