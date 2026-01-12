import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  scopes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import { revokeTeamScopedPermissionFromUser } from '../../../permissions/helpers/relationships/relationships.js'
import { memberOnlyScopeIdValidation } from '../../helpers/schemas.js'

const adminRemoveScopeFromMemberController = {
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
        scopeId: memberOnlyScopeIdValidation.required(),
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
