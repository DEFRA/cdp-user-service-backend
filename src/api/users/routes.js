import { createUserController } from './controllers/create-user.js'
import { deleteUserController } from './controllers/delete-user.js'
import { getAadUsersController } from './controllers/get-aad-users.js'
import { getGitHubUsersController } from './controllers/get-github-users.js'
import { getUserController } from './controllers/get-user.js'
import { getUsersController } from './controllers/get-users.js'
import { updateUserController } from './controllers/update-user.js'

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
        }
      ])
    }
  }
}

export { users }
