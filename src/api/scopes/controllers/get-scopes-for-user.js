import { scopesForUser } from '~/src/api/scopes/helpers/scopes-for-user.js'

const getScopesForUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials

    const { scopes, scopeFlags } = await scopesForUser(credentials, request.db)

    return h
      .response({
        message: 'success',
        scopes,
        scopeFlags
      })
      .code(200)
  }
}

export { getScopesForUserController }
