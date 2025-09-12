import Joi from '../../../../helpers/extended-joi.js'
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

    const scope = await deleteScopeTransaction({
      request,
      scopeId
    })

    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminDeleteScopeController }
