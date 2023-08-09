import { userController, usersController } from '~/src/api/users/controllers'

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
          method: 'GET',
          path: '/users/{userId}',
          ...userController
        }
      ])
    }
  }
}

export { users }
