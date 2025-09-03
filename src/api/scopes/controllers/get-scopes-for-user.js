import { scopesForUser } from '../helpers/scopes-for-user.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const getScopesForUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials
    const scope = await scopesForUser(credentials, request.db)

    return h.response(scope).code(statusCodes.ok)
  }
}

export { getScopesForUserController }
