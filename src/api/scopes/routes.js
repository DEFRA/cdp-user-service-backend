import { adminAddScopeToTeamController } from './controllers/admin/add-scope-to-team.js'
import { adminCreateScopeController } from './controllers/admin/create-scope.js'
import { adminDeleteScopeController } from './controllers/admin/delete-scope.js'
import { adminGetScopeController } from './controllers/admin/get-scope.js'
import { adminGetScopesController } from './controllers/admin/get-scopes.js'
import { adminRemoveScopeFromTeamController } from './controllers/admin/remove-scope-from-team.js'
import { adminUpdateScopeController } from './controllers/admin/update-scope.js'
import { getScopesForUserController } from './controllers/get-scopes-for-user.js'
import { adminAddScopeToUserController } from './controllers/admin/add-scope-to-user.js'
import { adminRemoveScopeFromUserController } from './controllers/admin/remove-scope-from-user.js'
import { adminGetScopeByNameController } from './controllers/admin/get-scope-by-name.js'

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
