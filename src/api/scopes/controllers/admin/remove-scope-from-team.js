import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { getTeam } from '../../../teams/helpers/get-team.js'
import { getScope } from '../../helpers/get-scope.js'
import { removeScopeFromTeamTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-team-transaction.js'

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
        scopeId: Joi.objectId().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const scopeId = request.params.scopeId

    const dbTeam = await getTeam(request.db, teamId)
    const dbScope = await getScope(request.db, scopeId)

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
