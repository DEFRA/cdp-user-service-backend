import { getScopesForUserController } from './controllers/get-scopes-for-user.js'
import { getActiveBreakGlassScopeForUser } from './controllers/get-active-break-glass-scope-for-user.js'
import { originalScopesForUser } from './helpers/original-scopes-for-user.js'

import { generateMermaidDiagram } from './helpers/relationships/mermaid-diagram.js'
import { compareScopesOverview } from './helpers/relationships/check-scope-migration.js'
import { backfill } from './helpers/relationships/backfill.js'
import { scopesForUser } from './helpers/relationships/legacy-scopes-for-user.js'

const permissions = {
  plugin: {
    name: 'permissions',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/scopes',
          ...getScopesForUserController
        },
        {
          method: 'GET',
          path: '/scopes/active-break-glass',
          ...getActiveBreakGlassScopeForUser
        },
        {
          method: 'GET',
          path: '/auth/perms',
          ...permsController
        },
        {
          method: 'GET',
          path: '/auth/graph',
          ...graphController
        },
        {
          method: 'GET',
          path: '/auth/backfill',
          ...backfillController
        }
      ])
    }
  }
}

const backfillController = {
  options: {},
  handler: async (request, h) => {
    await backfill(request.db)
    return h.response({}).code(200)
  }
}

const permsController = {
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

const graphController = {
  options: {},
  handler: async (request, h) => {
    const user = request.query.user

    const mermaid = await generateMermaidDiagram(request.db, user)
    return h.response(mermaid).type('text/plain').code(200)
  }
}

export { permissions }
