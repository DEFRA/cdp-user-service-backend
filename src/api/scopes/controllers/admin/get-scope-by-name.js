import Joi from '../../../../helpers/extended-joi.js'
import { getScopeByName } from '../../helpers/get-scope-by-name.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
