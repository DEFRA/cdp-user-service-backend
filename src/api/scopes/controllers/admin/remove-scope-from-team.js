import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import Joi from '~/src/helpers/extended-joi.js'
import { removeScopeFromTeam } from '~/src/helpers/mongo/transactions/remove-scope-from-team.js'

const adminRemoveScopeFromTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
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

    const scope = await removeScopeFromTeam(request, teamId, scopeId)
    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminRemoveScopeFromTeamController }
