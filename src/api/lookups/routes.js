import { getGitHubUsersController } from './controllers/get-github-users.js'
import { getAadUsersController } from './controllers/get-aad-users.js'
import { getGitHubTeamsController } from './controllers/get-github-teams.js'

const lookups = {
  plugin: {
    name: 'lookups',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/aad-users',
          ...getAadUsersController
        },
        {
          method: 'GET',
          path: '/github-users',
          ...getGitHubUsersController
        },
        {
          method: 'GET',
          path: '/github-teams',
          ...getGitHubTeamsController
        }
      ])
    }
  }
}

export { lookups }
