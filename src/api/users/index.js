import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
  updateUserGithubController,
  getAadUsersController,
  getGitHubUsersController
} from '~/src/api/users/controllers'

const users = {
  plugin: {
    name: 'users',
    register: async (server) => {
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
          method: 'PATCH',
          path: '/users/{userId}/github',
          ...updateUserGithubController
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
