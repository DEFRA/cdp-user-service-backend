import Boom from '@hapi/boom'
import { UTCDate } from '@date-fns/utc'
import { addHours } from 'date-fns'
import {
  scopes,
  statusCodes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import Joi from 'joi'
import { recordAudit } from '../../../helpers/audit/record-audit.js'
import { getUserOnly } from '../helpers/get-user.js'
import { grantTeamScopedPermissionToUser } from '../../permissions/helpers/relationships/relationships.js'
import { scopeDefinitions } from '../../../config/scopes.js'
import { getTeamOnly } from '../../teams/helpers/get-team.js'

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
    const scopeId = scopeDefinitions.breakGlass.scopeId

    const requestor = {
      id: request.auth.credentials.id,
      displayName: request.auth.credentials.displayName
    }

    // breakGlass start date is UTC now and end date is 2 hours later
    const utcDateNow = new UTCDate()
    const utcDatePlusTwoHours = addHours(utcDateNow, 2)

    const team = await getTeamOnly(request.db, teamId)
    const user = await getUserOnly(request.db, userId)

    if (!team) {
      return Boom.badRequest(`Invalid Team ID ${teamId}`)
    }

    if (!user) {
      return Boom.badRequest(`Invalid User ID ${userId}`)
    }

    request.logger.info(`granting breakGlass to ${teamId}/${userId}`)
    await grantTeamScopedPermissionToUser(
      request.db,
      userId,
      teamId,
      scopeId,
      utcDateNow,
      utcDatePlusTwoHours
    )

    request.logger.info(`auditing breakGlass of ${teamId}/${userId}`)
    await recordAudit({
      category: scopeId,
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

    request.logger.info(`break glass flow complete`)
    return h
      .response({
        scopeId,
        userId,
        teamId
      })
      .code(statusCodes.ok)
  }
}

export { addBreakGlassToMemberController }
