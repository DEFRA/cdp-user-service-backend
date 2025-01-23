import { getScopes } from '~/src/api/scopes/helpers/get-scopes.js'

const adminGetScopesController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    }
  },
  handler: async (request, h) => {
    const scopes = await getScopes(request.db)
    return h.response({ message: 'success', scopes }).code(200)
  }
}

export { adminGetScopesController }
