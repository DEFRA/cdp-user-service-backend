import Boom from '@hapi/boom'
import { UTCDate } from '@date-fns/utc'
import { addHours } from 'date-fns'

import Joi from '../../../helpers/extended-joi.js'
import { teamIdValidation, userIdValidation } from '@defra/cdp-validation-kit'
import { addScopeToMember } from '../../scopes/helpers/add-scope-to-member.js'
import { getScopeByName } from '../../scopes/helpers/get-scope-by-name.js'

const addProdAccessToMemberController = {
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

    // prodAccess start date is UTC now and end date is 2 hours later
    const utcDateNow = new UTCDate()
    const utcDatePlusTwoHours = addHours(utcDateNow, 2)

    const scope = await addScopeToMember({
      request,
      userId,
      scopeId: prodAccessScope?.scopeId?.toHexString(),
      teamId,
      startDate: utcDateNow,
      endDate: utcDatePlusTwoHours
    })

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { addProdAccessToMemberController }
