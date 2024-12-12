import { health } from '~/src/api/health/routes.js'
import { users } from '~/src/api/users/routes.js'
import { teams } from '~/src/api/teams/routes.js'
import { scopes } from '~/src/api/scopes/routes.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, users, teams, scopes])
    }
  }
}

export { router }
