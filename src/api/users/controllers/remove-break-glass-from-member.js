import Boom from '@hapi/boom'
import {
  scopes,
  statusCodes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import Joi from '../../../helpers/extended-joi.js'
import { getScopeByName } from '../../scopes/helpers/get-scope-by-name.js'
import { removeScopeFromMemberTransaction } from '../../../helpers/mongo/transactions/scope/remove-scope-from-member-transaction.js'
import { UTCDate } from '@date-fns/utc'
import { recordAudit } from '../../../helpers/audit/record-audit.js'
import { getUser } from '../helpers/get-user.js'

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
    const scope = await removeScopeFromMemberTransaction(
      request,
      userId,
      breakGlassScope?.scopeId?.toHexString(),
      teamId
    )
    const user = await getUser(request.db, userId)
    const team = user?.teams.find((t) => t.teamId === teamId)

    const utcDateNow = new UTCDate()
    await recordAudit({
      category: scopeName,
      action: 'Removed',
      performedBy: requestor,
      performedAt: utcDateNow,
      details: {
        user: {
          userId: user.userId,
          displayName: user?.name
        },
        team,
        endDate: utcDateNow
      }
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { removeBreakGlassFromMemberController }
