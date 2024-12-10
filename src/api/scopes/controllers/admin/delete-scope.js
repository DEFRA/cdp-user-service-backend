import Boom from '@hapi/boom'
import Joi from '~/src/helpers/extended-joi.js'
import { config } from '~/src/config/config.js'

import { scopeExists } from '~/src/api/scopes/helpers/scope-exists.js'
import { deleteScopeTransaction } from '~/src/helpers/mongo/transactions/scope/delete-scope-transaction.js'

const adminDeleteScopeController = {
  options: {
    tags: ['api', 'scopes'],
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
    const scopeId = params.scopeId

    const existingScope = await scopeExists(request.db, scopeId)
    if (!existingScope) {
      return Boom.conflict('Scope does not exist!')
    }
    const scope = await deleteScopeTransaction(request, params.scopeId)

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminDeleteScopeController }
