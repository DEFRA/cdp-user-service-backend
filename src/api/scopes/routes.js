import { adminAddScopeToTeamController } from '~/src/api/scopes/controllers/admin/add-scope-to-team.js'
import { adminCreateScopeController } from '~/src/api/scopes/controllers/admin/create-scope.js'
import { adminDeleteScopeController } from '~/src/api/scopes/controllers/admin/delete-scope.js'
import { adminGetScopeController } from '~/src/api/scopes/controllers/admin/get-scope.js'
import { adminGetScopesController } from '~/src/api/scopes/controllers/admin/get-scopes.js'
import { adminRemoveScopeFromTeamController } from '~/src/api/scopes/controllers/admin/remove-scope-from-team.js'
import { adminUpdateScopeController } from '~/src/api/scopes/controllers/admin/update-scope.js'
import { getScopesForUserController } from '~/src/api/scopes/controllers/get-scopes-for-user.js'
import { adminAddScopeToUserController } from '~/src/api/scopes/controllers/admin/add-scope-to-user.js'
import { adminRemoveScopeFromUserController } from '~/src/api/scopes/controllers/admin/remove-scope-from-user.js'
import { adminGetScopeByNameController } from '~/src/api/scopes/controllers/admin/get-scope-by-name.js'

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
          method: 'GET',
          path: '/scopes/admin/name/{scopeName}',
          ...adminGetScopeByNameController
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
          path: '/scopes/admin/{scopeId}/team/add/{teamId}',
          ...adminAddScopeToTeamController
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/team/remove/{teamId}',
          ...adminRemoveScopeFromTeamController
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/user/add/{userId}',
          ...adminAddScopeToUserController
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/user/remove/{userId}',
          ...adminRemoveScopeFromUserController
        }
      ])
    }
  }
}

export { scopes }
