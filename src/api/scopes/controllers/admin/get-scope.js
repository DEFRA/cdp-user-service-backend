import { getScope } from '../../helpers/get-scope.js'
import Joi from 'joi'
import { statusCodes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'

const adminGetScopeController = {
  options: {
    validate: {
      params: Joi.object({
        scopeId: Joi.string()
          .valid(...Object.keys(scopeDefinitions))
          .required()
      })
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
