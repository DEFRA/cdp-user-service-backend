import {
  adminGetScopeController,
  adminGetScopesController,
  adminCreateScopeController,
  adminUpdateScopeController,
  adminDeleteScopeController,
  getScopesForUserController
} from '~/src/api/scopes/controllers/index.js'

const scopes = {
  plugin: {
    name: 'scopes',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/scopes/admin',
          ...adminGetScopesController
        },
        {
          method: 'POST',
          path: '/scopes/admin',
          ...adminCreateScopeController
        },
        {
          method: 'GET',
          path: '/scopes/admin/{scopeId}',
          ...adminGetScopeController
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}',
          ...adminUpdateScopeController
        },
        {
          method: 'DELETE',
          path: '/scopes/admin/{scopeId}',
          ...adminDeleteScopeController
        },
        {
          method: 'GET',
          path: '/scopes',
          ...getScopesForUserController
        }
      ])
    }
  }
}

export { scopes }
