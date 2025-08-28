import Joi from '../../../../helpers/extended-joi.js'
import { getScope } from '../../helpers/get-scope.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const adminGetScopeController = {
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
    const scope = await getScope(request.db, request.params.scopeId)

    if (!scope) {
      return h
        .response({
          message: 'Scope not found',
          statusCode: statusCodes.notFound,
          error: 'Not Found'
        })
        .code(statusCodes.notFound)
    }

    return h.response({ message: 'success', scope }).code(statusCodes.ok)
  }
}

export { adminGetScopeController }
