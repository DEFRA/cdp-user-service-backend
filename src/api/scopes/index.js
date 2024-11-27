import { getScopesForUserController } from '~/src/api/scopes/controllers/get-scopes-for-user.js'

const scopes = {
  plugin: {
    name: 'scopes',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/scopes',
          ...getScopesForUserController
        }
      ])
    }
  }
}

export { scopes }
