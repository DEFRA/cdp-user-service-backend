import {
  createUserController,
  updateUserController,
  userController,
  usersController
} from '~/src/api/users/controllers'

const users = {
  plugin: {
    name: 'users',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/users',
          ...usersController
        },
        {
          method: 'POST',
          path: '/users',
          ...createUserController
        },
        {
          method: 'GET',
          path: '/users/{userId}',
          ...userController
        },
        {
          method: 'PATCH',
          path: '/users/{userId}',
          ...updateUserController
        }
      ])
    }
  }
}

export { users }
