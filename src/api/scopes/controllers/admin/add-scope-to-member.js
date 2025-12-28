import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  scopes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import {
  grantPermissionToUser,
  grantTemporaryPermissionToUser
} from '../../../permissions/helpers/relationships/relationships.js'

const adminAddScopeToMemberController = {
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
        scopeId: Joi.string().required(),
        teamId: teamIdValidation
      }),
      payload: Joi.object({
        startAt: Joi.date().iso().optional(),
        endAt: Joi.date().iso().optional()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const params = request.params
    const payload = request.payload

    const userId = params.userId
    const scopeId = params.scopeId
    const teamId = params.teamId

    const memberScope = `${scopeId}:team:${teamId}`

    const start = payload.startAt
    const end = payload.endAt

    if (start || end) {
      const scope = await grantTemporaryPermissionToUser(
        request.db,
        userId,
        memberScope,
        start,
        end
      )
      return h.response(scope).code(200)
    }

    {
      const scope = await grantPermissionToUser(request.db, userId, memberScope)
      return h.response(scope).code(200)
    }
  }
}

export { adminAddScopeToMemberController }
