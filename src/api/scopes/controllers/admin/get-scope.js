import Joi from 'joi'
import { getScope } from '../../helpers/get-scope.js'
import { scopes, statusCodes } from '@defra/cdp-validation-kit'

const adminGetScopeController = {
  options: {
    validate: {
      params: Joi.object({
        scopeId: Joi.string().required()
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

    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminGetScopeController }
