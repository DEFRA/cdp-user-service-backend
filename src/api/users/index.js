import { createUserController } from '~/src/api/users/controllers/create-user.js'
import { deleteUserController } from '~/src/api/users/controllers/delete-user.js'
import { getUserController } from '~/src/api/users/controllers/get-user.js'
import { getUsersController } from '~/src/api/users/controllers/get-users.js'
import { updateUserController } from '~/src/api/users/controllers/update-user.js'
import { getAadUsersController } from '~/src/api/users/controllers/get-aad-users.js'
import { getGitHubUsersController } from '~/src/api/users/controllers/get-github-users.js'
import { withTracing } from '~/src/helpers/tracing/tracing.js'

const users = {
  plugin: {
    name: 'users',
    register: (server) => {
      server.route(
        [
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
        ].map(withTracing)
      )
    }
  }
}

export { users }
