import Joi from '~/src/helpers/extended-joi.js'

import { config } from '~/src/config/index.js'
import { deleteScope } from '~/src/api/scopes/helpers/mongo/delete-scope.js'

const adminDeleteScopeController = {
  options: {
    validate: {
      params: Joi.object({
        scopeId: Joi.objectId().required()
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
    const params = request.params
    const scope = await deleteScope(request.db, params.scopeId)

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminDeleteScopeController }
