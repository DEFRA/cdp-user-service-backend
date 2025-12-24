import { createUserController } from './controllers/create-user.js'
import { deleteUserController } from './controllers/delete-user.js'
import { getUserController } from './controllers/get-user.js'
import { getUsersController } from './controllers/get-users.js'
import { updateUserController } from './controllers/update-user.js'
import { getUsersWithScopeForTeamController } from './controllers/get-users-with-scope-for-team.js'
import { addScopeToUserController } from './controllers/add-scope-to-user.js'
import { addBreakGlassToMemberController } from './controllers/add-break-glass-to-member.js'
import { removeBreakGlassFromMemberController } from './controllers/remove-break-glass-from-member.js'
import { getUsersForTeamController } from './controllers/get-users-for-team.js'

const users = {
  plugin: {
    name: 'users',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/users',
          ...getUsersController
        },
        {
          method: 'GET',
          path: '/users/team/{teamId}',
          ...getUsersForTeamController
        },
        {
          method: 'GET',
          path: '/users/{teamId}/{scopeId}',
          ...getUsersWithScopeForTeamController
        },
        {
          method: 'POST',
          path: '/users',
          ...createUserController
        },
        {
          method: 'GET',
          path: '/users/{userId}',
          ...getUserController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}',
          ...updateUserController
        },
        {
          method: 'DELETE',
          path: '/users/{userId}',
          ...deleteUserController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}/{scopeId}',
          ...addScopeToUserController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}/add-break-glass/{teamId}',
          ...addBreakGlassToMemberController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}/remove-break-glass/{teamId}',
          ...removeBreakGlassFromMemberController
        }
      ])
    }
  }
}

export { users }
