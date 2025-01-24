import Boom from '@hapi/boom'

import Joi from '~/src/helpers/extended-joi.js'
import { removeScopeFromTeamTransaction } from '~/src/helpers/mongo/transactions/scope/remove-scope-from-team-transaction.js'

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

    const scope = await removeScopeFromTeamTransaction(request, teamId, scopeId)
    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminRemoveScopeFromTeamController }
