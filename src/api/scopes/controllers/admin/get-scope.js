import Joi from '~/src/helpers/extended-joi.js'
import { getScope } from '~/src/api/scopes/helpers/get-scope.js'

const adminGetScopeController = {
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
        scope: ['admin']
      }
    }
  },
  handler: async (request, h) => {
    const scope = await getScope(request.db, request.params.scopeId)

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

export { adminGetScopeController }
