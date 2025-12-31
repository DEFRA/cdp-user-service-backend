import Joi from 'joi'
import { statusCodes } from '@defra/cdp-validation-kit'
import { getScope } from '../../helpers/get-scope.js'

const adminGetScopeByNameController = {
  options: {
    validate: {
      params: Joi.object({
        scopeName: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const scope = await getScope(request.db, request.params.scopeName)

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
