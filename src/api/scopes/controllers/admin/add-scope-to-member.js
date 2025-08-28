import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
import { addScopeToMember } from '../../helpers/add-scope-to-member.js'

const adminAddScopeToMemberController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation,
        scopeId: Joi.objectId().required(),
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
    const userId = params.userId
    const scopeId = params.scopeId
    const teamId = params.teamId

    const payload = request.payload
    const startDate = payload?.startAt ? new Date(payload.startAt) : undefined
    const endDate = payload?.endAt ? new Date(payload.endAt) : undefined

    const scope = await addScopeToMember({
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

export { adminAddScopeToMemberController }
