import { statusCodes } from '@defra/cdp-validation-kit'
import { getLegacyScopesForUser } from '../helpers/relationships/legacy-scopes-for-user.js'

const getScopesForUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials
    const scope = await getLegacyScopesForUser(request.db, credentials?.id)
    return h.response(scope).code(statusCodes.ok)
  }
}

export { getScopesForUserController }
