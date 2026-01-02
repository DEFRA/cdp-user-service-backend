import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  statusCodes,
  teamIdValidation,
  scopes
} from '@defra/cdp-validation-kit'

import { getTeam } from '../../../teams/helpers/get-team.js'
import { grantPermissionToTeam } from '../../../permissions/helpers/relationships/relationships.js'
import { teamScopeIdValidation } from '../../helpers/schemas.js'

const adminAddScopeToTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    },
    validate: {
      params: Joi.object({
        teamId: teamIdValidation,
        scopeId: teamScopeIdValidation.required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const scopeId = request.params.scopeId

    const dbTeam = await getTeam(request.db, teamId)

    if (!dbTeam) {
      throw Boom.notFound('Team not found')
    }

    const scope = await grantPermissionToTeam(request.db, teamId, scopeId)
    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminAddScopeToTeamController }
