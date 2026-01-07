import { adminAddScopeToTeamController } from './controllers/admin/add-scope-to-team.js'
import { adminGetScopeController } from './controllers/admin/get-scope.js'
import { adminGetScopesController } from './controllers/admin/get-scopes.js'
import { adminRemoveScopeFromTeamController } from './controllers/admin/remove-scope-from-team.js'
import { adminRemoveScopeFromUserController } from './controllers/admin/remove-scope-from-user.js'
import { adminAddScopeToMemberController } from './controllers/admin/add-scope-to-member.js'
import { adminRemoveScopeFromMemberController } from './controllers/admin/remove-scope-from-member.js'
import { adminAddScopeToUserController } from './controllers/admin/add-scope-to-user.js'

const scopesAdmin = {
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
          method: 'GET',
          path: '/scopes/admin/{scopeId}',
          ...adminGetScopeController
        },
        {
          method: 'GET',
          path: '/scopes/admin/name/{scopeId}',
          ...adminGetScopeController
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
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/member/add/{userId}/team/{teamId}',
          ...adminAddScopeToMemberController
        },
        {
          method: 'PATCH',
          path: '/scopes/admin/{scopeId}/member/remove/{userId}/team/{teamId}',
          ...adminRemoveScopeFromMemberController
        }
      ])
    }
  }
}

export { scopesAdmin }
