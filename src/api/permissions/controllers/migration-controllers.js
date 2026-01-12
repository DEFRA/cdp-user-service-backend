import { compareScopesOverview } from '../helpers/relationships/check-scope-migration.js'
import { scopesForUser } from '../helpers/relationships/legacy-scopes-for-user.js'
import { originalScopesForUser } from '../helpers/original-scopes-for-user.js'
import { backfill } from '../helpers/relationships/backfill.js'

const backfillController = {
  options: {},
  handler: async (request, h) => {
    await backfill(request.db)
    return h.response({}).code(200)
  }
}

const checkBackfillController = {
  options: {},
  handler: async (request, h) => {
    const user = request.query.user

    if (user) {
      const v2Perms = await scopesForUser(request.db, user)
      const v1Perms = await originalScopesForUser({ id: user }, request.db)
      return h.response({ v2: v2Perms, v1: v1Perms }).code(200)
    } else {
      const allPerms = await compareScopesOverview(request.db)
      return h.response(allPerms).code(200)
    }
  }
}

export { backfillController, checkBackfillController }
