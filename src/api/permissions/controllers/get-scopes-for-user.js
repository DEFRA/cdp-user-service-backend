import { statusCodes } from '@defra/cdp-validation-kit'
import { scopesForUser } from '../helpers/relationships/legacy-scopes-for-user.js'

const getScopesForUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials
    const scope = await scopesForUser(request.db, credentials?.id)
    return h.response(scope).code(statusCodes.ok)
  }
}

export { getScopesForUserController }
