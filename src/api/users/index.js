import {
  createUserController,
  getUserController,
  getUsersController,
  updateUserController,
  getAadUsersController
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
          method: 'GET',
          path: '/aad-users',
          ...getAadUsersController
        }
      ])
    }
  }
}

export { users }
