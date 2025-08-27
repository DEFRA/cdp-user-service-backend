import { getScopes } from '../../helpers/get-scopes.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const adminGetScopesController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    const userScopes = await getScopes(request.db)
    return h
      .response({ message: 'success', scopes: userScopes })
      .code(statusCodes.ok)
  }
}

export { adminGetScopesController }
