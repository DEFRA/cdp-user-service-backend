import Boom from '@hapi/boom'
import Joi from 'joi'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { getTeam } from '../../../teams/helpers/get-team.js'
import { getScope } from '../../helpers/get-scope.js'
import { removeScopeFromTeamTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-team-transaction.js'
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

    const dbTeam = await getTeam(request.db, teamId)
    const dbScope = await getScope(request.db, scopeId)

    await revokePermissionFromTeam(request.db, teamId, scopeId)

    const scope = await removeScopeFromTeamTransaction({
      request,
      teamId,
      teamName: dbTeam.name,
      scopeId,
      scopeName: dbScope.value
    })
    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminRemoveScopeFromTeamController }
