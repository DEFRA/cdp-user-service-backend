import { adminGetScopesController } from '~/src/api/scopes/controllers/admin/get-scopes.js'
import { adminGetScopeController } from '~/src/api/scopes/controllers/admin/get-scope.js'
import { adminCreateScopeController } from '~/src/api/scopes/controllers/admin/create-scope.js'
import { getScopesForUserController } from '~/src/api/scopes/controllers/get-scopes-for-user.js'
import { adminUpdateScopeController } from '~/src/api/scopes/controllers/admin/update-scope.js'
import { adminDeleteScopeController } from '~/src/api/scopes/controllers/admin/delete-scope.js'
import { adminAddScopeToTeamController } from '~/src/api/scopes/controllers/admin/add-scope-to-team.js'
import { adminRemoveScopeFromTeamController } from '~/src/api/scopes/controllers/admin/remove-scope-from-team.js'

export {
  adminGetScopeController,
  adminGetScopesController,
  adminCreateScopeController,
  adminUpdateScopeController,
  adminDeleteScopeController,
  getScopesForUserController,
  adminAddScopeToTeamController,
  adminRemoveScopeFromTeamController
}
