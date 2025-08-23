import Boom from '@hapi/boom'

import Joi from '../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
import { addScopeToUser } from '../../scopes/helpers/add-scope-to-user.js'
import { getScope } from '../../scopes/helpers/get-scope.js'
import { addYears } from '../../../helpers/date/add-years.js'

const addProdAccessToUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', 'canGrantProdAccess'] // FIXME: look at interrogating teamScopes: https://hapi.dev/api/?v=21.4.3#route.options.auth.access.scope
        // scope: [
        //   'permission:admin',
        //   'team:{payload.teamId}',
        //   'permission:canGrantProdAccess:team:{payload.teamId}'
        // ]
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation
      }),
      payload: Joi.object({
        teamId: teamIdValidation,
        startAt: Joi.date().iso().required(),
        endAt: Joi.date().iso().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId

    const payload = request.payload
    const teamId = payload.teamId

    const now = new Date()
    const startDate = payload.startAt ? new Date(payload.startAt) : now
    const endDate = payload.endAt ? new Date(payload.endAt) : addYears(now, 100)

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
