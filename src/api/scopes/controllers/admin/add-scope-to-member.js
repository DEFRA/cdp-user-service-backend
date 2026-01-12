import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  scopes,
  teamIdValidation,
  userIdValidation
} from '@defra/cdp-validation-kit'

import { grantTeamScopedPermissionToUser } from '../../../permissions/helpers/relationships/relationships.js'
import { memberOnlyScopeIdValidation } from '../../helpers/schemas.js'
import { getTeam } from '../../../teams/helpers/get-team.js'
import { getUser } from '../../../users/helpers/get-user.js'

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
        scopeId: memberOnlyScopeIdValidation.required(),
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

    const start = request.payload?.startAt
    const end = request.payload?.endAt

    const dbTeam = await getTeam(request.db, teamId)
    if (!dbTeam) {
      throw Boom.notFound('Team not found')
    }

    const dbUser = await getUser(request.db, userId)
    if (!dbUser) {
      throw Boom.notFound('User not found')
    }

    const scope = await grantTeamScopedPermissionToUser(
      request.db,
      userId,
      teamId,
      scopeId,
      start,
      end
    )
    return h.response(scope).code(200)
  }
}

export { adminAddScopeToMemberController }
