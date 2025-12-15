import Joi from 'joi'
import { getScopeByName } from '../../helpers/get-scope-by-name.js'
import { statusCodes, scopes } from '@defra/cdp-validation-kit'

const adminGetScopeByNameController = {
  options: {
    validate: {
      params: Joi.object({
        scopeName: Joi.string().required()
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, scopes.testAsTenant]
      }
    }
  },
  handler: async (request, h) => {
    const scope = await getScopeByName(request.db, request.params.scopeName)

    if (!scope) {
      return h
        .response({
          message: 'Scope not found',
          statusCode: 404,
          error: 'Not Found'
        })
        .code(404)
    }

    return h.response(scope).code(statusCodes.ok)
  }
}

export { adminGetScopeByNameController }
