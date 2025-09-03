import { statusCodes } from '@defra/cdp-validation-kit'
import { getActiveBreakGlass } from '../helpers/get-active-break-glass.js'

const getActiveBreakGlassScopeForUser = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const scope = await getActiveBreakGlass(
      request.db,
      request.auth.credentials
    )

    return h
      .response({
        activeBreakGlass: scope?.activeBreakGlass ?? null
      })
      .code(statusCodes.ok)
  }
}

export { getActiveBreakGlassScopeForUser }
