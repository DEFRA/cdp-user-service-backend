import { createUserController } from './controllers/create-user.js'
import { deleteUserController } from './controllers/delete-user.js'
import { getAadUsersController } from './controllers/get-aad-users.js'
import { getGitHubUsersController } from './controllers/get-github-users.js'
import { getUserController } from './controllers/get-user.js'
import { getUsersController } from './controllers/get-users.js'
import { updateUserController } from './controllers/update-user.js'
import { getUsersWithScopeForTeamController } from './controllers/get-users-with-scope-for-team.js'
import { addScopeToUserController } from './controllers/add-scope-to-user.js'
import { addProdAccessToMemberController } from './controllers/add-prod-access-to-member.js'
import { removeProdAccessFromMemberController } from './controllers/remove-prod-access-from-member.js'
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
          method: 'GET',
          path: '/aad-users',
          ...getAadUsersController
        },
        {
          method: 'GET',
          path: '/github-users',
          ...getGitHubUsersController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}/{scopeId}',
          ...addScopeToUserController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}/add-prod-access/{teamId}',
          ...addProdAccessToMemberController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}/remove-prod-access/{teamId}',
          ...removeProdAccessFromMemberController
        }
      ])
    }
  }
}

export { users }
