import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { removeScopeFromTeamTransaction } from '../../../../helpers/mongo/transactions/scope/remove-scope-from-team-transaction.js'
import { getTeam } from '../../../teams/helpers/get-team.js'
import { getScope } from '../../helpers/get-scope.js'

const adminRemoveScopeFromTeamController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        teamId: Joi.string().guid().required(),
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
    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminRemoveScopeFromTeamController }
