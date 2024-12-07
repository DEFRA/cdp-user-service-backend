import { addTeamToSharedReposController } from '~/src/api/teams/controllers/add-team-to-shared-repos.js'
import { addUserToTeamController } from '~/src/api/teams/controllers/add-user-to-team.js'
import { createTeamController } from '~/src/api/teams/controllers/create-team.js'
import { deleteTeamController } from '~/src/api/teams/controllers/delete-team.js'
import { getGitHubTeamsController } from '~/src/api/teams/controllers/get-github-teams.js'
import { getTeamController } from '~/src/api/teams/controllers/get-team.js'
import { getTeamsController } from '~/src/api/teams/controllers/get-teams.js'
import { removeUserFromTeamController } from '~/src/api/teams/controllers/remove-user-from-team.js'
import { updateTeamController } from '~/src/api/teams/controllers/update-team.js'

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
