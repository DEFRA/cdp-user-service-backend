import Joi from '../../../../helpers/extended-joi.js'
import { getScopeByName } from '../../helpers/get-scope-by-name.js'

const adminGetScopeByNameController = {
  options: {
    tags: ['api', 'scopes'],
    validate: {
      params: Joi.object({
        scopeName: Joi.string().required()
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', 'testAsTenant']
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

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminGetScopeByNameController }
