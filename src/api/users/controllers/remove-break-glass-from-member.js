import { UTCDate } from '@date-fns/utc'
import Boom from '@hapi/boom'
import {
  scopes,
  statusCodes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import Joi from 'joi'
import { getUser } from '../helpers/get-user.js'
import { recordAudit } from '../../../helpers/audit/record-audit.js'
import { getScopeByName } from '../../scopes/helpers/get-scope-by-name.js'
import { removeScopeFromMemberTransaction } from '../../../helpers/mongo/transactions/scope/remove-scope-from-member-transaction.js'
import { maybeObjectId } from '../../../helpers/maybe-objectid.js'

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

    const requestor = {
      id: request.auth.credentials.id,
      displayName: request.auth.credentials.displayName
    }

    const scopeName = 'breakGlass'
    const breakGlassScope = await getScopeByName(request.db, scopeName)
    const scope = await removeScopeFromMemberTransaction({
      request,
      userId,
      scopeId: maybeObjectId(breakGlassScope?.scopeId),
      teamId
    })

    const user = await getUser(request.db, userId)
    const team = user?.teams.find((t) => t.teamId === teamId)
    // TODO: handle this as an edge case?
    const now = new UTCDate()
    await recordAudit({
      category: scopeName,
      action: 'Removed',
      performedBy: requestor,
      performedAt: now,
      details: {
        user: {
          userId: user.userId,
          displayName: user.name
        },
        team,
        endDate: now
      }
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { removeBreakGlassFromMemberController }
