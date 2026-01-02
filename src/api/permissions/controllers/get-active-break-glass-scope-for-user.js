import { statusCodes } from '@defra/cdp-validation-kit'
import { findActiveBreakGlassForUser } from '../helpers/relationships/relationships.js'

const getActiveBreakGlassScopeForUser = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const breakGlass = await findActiveBreakGlassForUser(
      request.db,
      request.auth.credentials
    )

    const breakGlassStatus = breakGlass.map((s) => ({
      scopeId: 'breakGlass',
      scopeName: 'breakGlass',
      teamId: s.resource,
      teamName: s.resource,
      startAt: s.start,
      endAt: s.end
    }))

    return h
      .response({
        activeBreakGlass: breakGlassStatus.at(0) ?? null
      })
      .code(statusCodes.ok)
  }
}

export { getActiveBreakGlassScopeForUser }
