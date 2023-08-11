import { health } from '~/src/api/health'
import { users } from '~/src/api/users'
import { teams } from '~/src/api/teams'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, users, teams])
    }
  }
}

export { router }
