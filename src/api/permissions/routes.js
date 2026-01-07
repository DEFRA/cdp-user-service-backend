import { getScopesForUserController } from './controllers/get-scopes-for-user.js'
import { getActiveBreakGlassScopeForUser } from './controllers/get-active-break-glass-scope-for-user.js'
import { mermaidDiagramController } from './controllers/mermaid-diagram-controller.js'
import {
  backfillController,
  checkBackfillController
} from './controllers/migration-controllers.js'

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
          path: '/auth/diagram',
          ...mermaidDiagramController
        },
        {
          method: 'GET',
          path: '/auth/backfill',
          ...backfillController
        },
        {
          method: 'GET',
          path: '/auth/check-backfill',
          ...checkBackfillController
        }
      ])
    }
  }
}

export { permissions }
