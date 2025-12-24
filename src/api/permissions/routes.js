import { getScopesForUserController } from './controllers/get-scopes-for-user.js'
import { getActiveBreakGlassScopeForUser } from './controllers/get-active-break-glass-scope-for-user.js'

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
        }
      ])
    }
  }
}

export { permissions }
