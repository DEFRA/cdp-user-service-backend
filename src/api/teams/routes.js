import { addTeamToSharedReposController } from './controllers/add-team-to-shared-repos.js'
import { addUserToTeamController } from './controllers/add-user-to-team.js'
import { createTeamController } from './controllers/create-team.js'
import { deleteTeamController } from './controllers/delete-team.js'
import { getGitHubTeamsController } from './controllers/get-github-teams.js'
import { getTeamController } from './controllers/get-team.js'
import { getTeamsController } from './controllers/get-teams.js'
import { removeUserFromTeamController } from './controllers/remove-user-from-team.js'
import { updateTeamController } from './controllers/update-team.js'

const teams = {
  plugin: {
    name: 'teams',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/teams',
          ...getTeamsController
        },
        {
          method: 'POST',
          path: '/teams',
          ...createTeamController
        },
        {
          method: 'GET',
          path: '/teams/{teamId}',
          ...getTeamController
        },
        {
          method: 'PATCH',
          path: '/teams/{teamId}',
          ...updateTeamController
        },
        {
          method: 'DELETE',
          path: '/teams/{teamId}',
          ...deleteTeamController
        },
        {
          method: 'PATCH',
          path: '/teams/{teamId}/add/{userId}',
          ...addUserToTeamController
        },
        {
          method: 'PATCH',
          path: '/teams/{teamId}/remove/{userId}',
          ...removeUserFromTeamController
        },
        {
          method: 'GET',
          path: '/github-teams',
          ...getGitHubTeamsController
        },
        {
          method: 'POST',
          path: '/shared-repos',
          ...addTeamToSharedReposController
        }
      ])
    }
  }
}

export { teams }
