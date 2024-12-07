import { config } from '~/src/config/config.js'
import { getScopes } from '~/src/api/scopes/helpers/get-scopes.js'

const adminGetScopesController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    const scopes = await getScopes(request.db)
    return h.response({ message: 'success', scopes }).code(200)
  }
}

export { adminGetScopesController }
