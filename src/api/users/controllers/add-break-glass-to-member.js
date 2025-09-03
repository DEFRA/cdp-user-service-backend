import Boom from '@hapi/boom'
import { UTCDate } from '@date-fns/utc'
import { addHours } from 'date-fns'
import {
  scopes,
  statusCodes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import Joi from '../../../helpers/extended-joi.js'
import { addScopeToMember } from '../../scopes/helpers/add-scope-to-member.js'
import { getScopeByName } from '../../scopes/helpers/get-scope-by-name.js'

const addBreakGlassToMemberController = {
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

    // breakGlass start date is UTC now and end date is 2 hours later
    const utcDateNow = new UTCDate()
    const utcDatePlusTwoHours = addHours(utcDateNow, 2)

    const scope = await addScopeToMember({
      request,
      userId,
      scopeId: breakGlassScope?.scopeId?.toHexString(),
      teamId,
      startDate: utcDateNow,
      endDate: utcDatePlusTwoHours
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { addBreakGlassToMemberController }
