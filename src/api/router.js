import { health } from '~/src/api/health/index.js'
import { users } from '~/src/api/users/index.js'
import { teams } from '~/src/api/teams/index.js'
import { scopes } from '~/src/api/scopes/index.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, users, teams, scopes])
    }
  }
}

export { router }
