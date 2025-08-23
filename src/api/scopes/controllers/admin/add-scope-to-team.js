import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { getTeam } from '../../../teams/helpers/get-team.js'
import { getScope } from '../../helpers/get-scope.js'
import { addScopeToTeamTransaction } from '../../../../helpers/mongo/transactions/scope/add-scope-to-team-transaction.js'
import { teamIdValidation } from '@defra/cdp-validation-kit'

const adminAddScopeToTeamController = {
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

    if (!dbTeam) {
      throw Boom.notFound('Team not found')
    }

    if (!dbScope) {
      throw Boom.notFound('Scope not found')
    }

    if (!dbScope.kind.includes('team')) {
      throw Boom.badRequest('Scope cannot be applied to a team')
    }

    const scope = await addScopeToTeamTransaction({
      request,
      teamId,
      teamName: dbTeam.name,
      scopeId,
      scopeName: dbScope.value
    })

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminAddScopeToTeamController }
