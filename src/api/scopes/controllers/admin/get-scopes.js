import { config } from '~/src/config/index.js'
import { getScopes } from '~/src/api/scopes/helpers/mongo/get-scopes.js'

const adminGetScopesController = {
  options: {
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
