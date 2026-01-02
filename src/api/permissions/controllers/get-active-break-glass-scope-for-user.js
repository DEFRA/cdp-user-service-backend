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
      request.auth.credentials.id
    )

    const activeBreakGlass = breakGlass
      .map((s) => ({
        scopeId: 'breakGlass',
        scopeName: 'breakGlass',
        teamId: s.resource,
        teamName: s.resource,
        startAt: s.start,
        endAt: s.end
      }))
      .at(0)

    return h
      .response(
        activeBreakGlass
          ? {
              activeBreakGlass
            }
          : null
      )
      .code(statusCodes.ok)
  }
}

export { getActiveBreakGlassScopeForUser }
