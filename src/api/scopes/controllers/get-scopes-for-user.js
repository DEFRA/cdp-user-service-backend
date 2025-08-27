import { scopesForUser } from '../helpers/scopes-for-user.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const getScopesForUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials

    const scope = await scopesForUser(credentials, request.db)

    return h
      .response({
        message: 'success',
        ...scope
      })
      .code(statusCodes.ok)
  }
}

export { getScopesForUserController }
