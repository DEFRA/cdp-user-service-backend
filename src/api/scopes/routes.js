import { adminAddScopeToTeamController } from '~/src/api/scopes/controllers/admin/add-scope-to-team.js'
import { adminCreateScopeController } from '~/src/api/scopes/controllers/admin/create-scope.js'
import { adminDeleteScopeController } from '~/src/api/scopes/controllers/admin/delete-scope.js'
import { adminGetScopeController } from '~/src/api/scopes/controllers/admin/get-scope.js'
import { adminGetScopesController } from '~/src/api/scopes/controllers/admin/get-scopes.js'
import { adminRemoveScopeFromTeamController } from '~/src/api/scopes/controllers/admin/remove-scope-from-team.js'
import { adminUpdateScopeController } from '~/src/api/scopes/controllers/admin/update-scope.js'
import { getScopesForUserController } from '~/src/api/scopes/controllers/get-scopes-for-user.js'

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
