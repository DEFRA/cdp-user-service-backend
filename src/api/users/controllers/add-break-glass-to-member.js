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
import { recordAudit } from '../../../helpers/audit/record-audit.js'
import { getUser } from '../helpers/get-user.js'

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
      payload: Joi.object({
        reason: Joi.string().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const params = request.params
    const userId = params.userId
    const teamId = params.teamId
    const payload = request.payload
    const reason = payload.reason

    const requestor = {
      id: request.auth.credentials.id,
      displayName: request.auth.credentials.displayName
    }

    const scopeName = 'breakGlass'
    const breakGlassScope = await getScopeByName(request.db, scopeName)

    // breakGlass start date is UTC now and end date is 2 hours later
    const utcDateNow = new UTCDate()
    const utcDatePlusTwoHours = addHours(utcDateNow, 2)
    const scope = await addScopeToMember({
      request,
      userId,
      scopeId: breakGlassScope?.scopeId?.toHexString(),
      teamId,
      startDate: utcDateNow,
      endDate: utcDatePlusTwoHours,
      requestor,
      reason
    })

    const user = await getUser(request.db, userId)
    const team = user?.teams.find((t) => t.teamId === teamId)

    await recordAudit({
      category: scopeName,
      action: 'Granted',
      performedBy: requestor,
      performedAt: utcDateNow,
      details: {
        user: {
          userId: user.userId,
          displayName: user?.name
        },
        team,
        startDate: utcDateNow,
        endDate: utcDatePlusTwoHours,
        reason
      }
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { addBreakGlassToMemberController }
