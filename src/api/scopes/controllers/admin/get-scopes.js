import { getScopes } from '../../helpers/get-scopes.js'
import { scopes, statusCodes } from '@defra/cdp-validation-kit'

const adminGetScopesController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    const userScopes = await getScopes(request.db)
    return h.response(userScopes).code(statusCodes.ok)
  }
}

export { adminGetScopesController }
