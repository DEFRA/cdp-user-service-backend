import Boom from '@hapi/boom'

import Joi from '~/src/helpers/extended-joi.js'
import { config } from '~/src/config/index.js'
import { getTeam } from '~/src/api/teams/helpers/get-team.js'
import { getScope } from '~/src/api/scopes/helpers/get-scope.js'
import { addScopeToTeam } from '~/src/helpers/mongo/transactions/add-scope-to-team.js'

const adminAddScopeToTeamController = {
  options: {
    tags: ['api', 'scopes'],
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

    const dbTeam = await getTeam(request.db, teamId)
    const dbScope = await getScope(request.db, scopeId)

    if (!dbTeam) {
      throw Boom.notFound('Team not found')
    }

    if (!dbScope) {
      throw Boom.notFound('Scope not found')
    }

    const scope = await addScopeToTeam(request, teamId, scopeId)

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminAddScopeToTeamController }
