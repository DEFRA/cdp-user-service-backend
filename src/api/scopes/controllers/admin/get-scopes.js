import { getScopes } from '../../helpers/get-scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const adminGetScopesController = {
  handler: async (request, h) => {
    const availableScopes = getScopes()
    return h.response(availableScopes).code(statusCodes.ok)
  }
}

export { adminGetScopesController }
