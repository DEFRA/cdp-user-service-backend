import { health } from '~/src/api/health'
import { users } from '~/src/api/users'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, users])
    }
  }
}

export { router }
