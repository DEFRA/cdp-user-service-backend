import {
  adminGetScopeController,
  adminGetScopesController,
  adminCreateScopeController,
  adminUpdateScopeController,
  adminDeleteScopeController,
  adminAddScopeToTeamController,
  getScopesForUserController,
  adminRemoveScopeFromTeamController
} from '~/src/api/scopes/controllers/index.js'

const scopes = {
  plugin: {
    name: 'scopes',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/scopes',
          ...getScopesForUserController
        },
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
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/add/{teamId}',
          ...adminAddScopeToTeamController
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/remove/{teamId}',
          ...adminRemoveScopeFromTeamController
        }
      ])
    }
  }
}

export { scopes }
