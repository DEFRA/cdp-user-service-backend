import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  scopes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import { revokeTeamScopedPermissionFromUser } from '../../../permissions/helpers/relationships/relationships.js'

const adminRemoveScopeFromMemberController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, scopes.testAsTenant]
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation,
        scopeId: Joi.string().required(),
        teamId: teamIdValidation
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const params = request.params
    const userId = params.userId
    const scopeId = params.scopeId
    const teamId = params.teamId

    const scope = await revokeTeamScopedPermissionFromUser(
      request.db,
      userId,
      teamId,
      scopeId
    )
    return h.response(scope).code(200)
  }
}

export { adminRemoveScopeFromMemberController }
