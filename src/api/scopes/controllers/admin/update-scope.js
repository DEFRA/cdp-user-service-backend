import Joi from '~/src/helpers/extended-joi.js'
import Boom from '@hapi/boom'

import { config } from '~/src/config/config.js'
import { updateScope } from '~/src/api/scopes/helpers/update-scope.js'
import { scopeExists } from '~/src/api/scopes/helpers/scope-exists.js'

const adminUpdateScopeController = {
  options: {
    tags: ['api', 'scopes'],
    validate: {
      params: Joi.object({
        scopeId: Joi.objectId().required()
      }),
      payload: Joi.object({
        description: Joi.string().optional().max(256)
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    const payload = request.payload
    const params = request.params
    const scopeId = params.scopeId

    const existingScope = await scopeExists(request.db, scopeId)
    if (!existingScope) {
      return Boom.conflict('Scope does not exist!')
    }

    const scope = await updateScope(request.db, scopeId, {
      description: payload.description
    })

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminUpdateScopeController }
