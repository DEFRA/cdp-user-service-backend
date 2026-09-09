import { statusCodes } from '@defra/cdp-validation-kit'
import { scopesForUser } from '../helpers/relationships/scopes-for-user.js'
import { updateLastActive } from '../../users/helpers/update-last-active.js'
import { getUserOnly } from '../../users/helpers/get-user.js'

const getScopesForUserController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const credentials = request.auth.credentials
    const user = await getUserOnly(request.db, credentials?.id)

    if (user?.disabled) {
      return h
        .response({
          scopes: [],
          scopeFlags: {
            isAdmin: false,
            isTenant: false,
            hasBreakGlass: false,
            isDisabled: true
          }
        })
        .code(statusCodes.ok)
    }

    const scope = await scopesForUser(request.db, credentials?.id)
    await updateLastActive(request.db, credentials?.id)
    return h
      .response({
        ...scope,
        scopeFlags: {
          ...scope.scopeFlags,
          isDisabled: false
        }
      })
      .code(statusCodes.ok)
  }
}

export { getScopesForUserController }
