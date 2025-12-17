import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  scopes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import { addScopeToMember } from '../../helpers/add-scope-to-member.js'

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

    const scope = await addScopeToMember({
      request,
      userId,
      scopeId,
      teamId,
      startDate: payload.startAt,
      endDate: payload.endAt
    })

    return h.response(scope).code(200)
  }
}

export { adminAddScopeToMemberController }
