import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { revokePermissionFromTeam } from '../../../permissions/helpers/relationships/relationships.js'

const adminRemoveScopeFromTeamController = {
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
        scopeId: Joi.string().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const scopeId = request.params.scopeId
    const scope = await revokePermissionFromTeam(request.db, teamId, scopeId)
    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminRemoveScopeFromTeamController }
