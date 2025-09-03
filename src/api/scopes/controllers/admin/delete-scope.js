import Boom from '@hapi/boom'
import Joi from '../../../../helpers/extended-joi.js'

import { scopeExists } from '../../helpers/scope-exists.js'
import { deleteScopeTransaction } from '../../../../helpers/mongo/transactions/scope/delete-scope-transaction.js'
import { scopes, statusCodes } from '@defra/cdp-validation-kit'

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
        scope: [scopes.admin]
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

    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminDeleteScopeController }
