import { health } from './health/routes.js'
import { users } from './users/routes.js'
import { teams } from './teams/routes.js'
import { scopes } from './scopes/routes.js'
import { permissions } from './permissions/routes.js'
import { lookups } from './lookups/routes.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        users,
        teams,
        scopes,
        permissions,
        lookups
      ])
    }
  }
}

export { router }
