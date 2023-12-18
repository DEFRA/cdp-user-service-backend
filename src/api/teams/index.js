import {
  addUserToTeamController,
  createTeamController,
  getTeamController,
  getTeamsController,
  removeUserFromTeamController,
  updateTeamController,
  getGitHubTeamsController,
  addTeamToSharedReposController
} from '~/src/api/teams/controllers'

const teams = {
  plugin: {
    name: 'teams',
    register: async (server) => {
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
