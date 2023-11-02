import { getTeamController } from '~/src/api/teams/controllers/get-team'
import { getTeamsController } from '~/src/api/teams/controllers/get-teams'
import { createTeamController } from '~/src/api/teams/controllers/create-team'
import { updateTeamController } from '~/src/api/teams/controllers/update-team'
import { addUserToTeamController } from '~/src/api/teams/controllers/add-user-to-team'
import { removeUserFromTeamController } from '~/src/api/teams/controllers/remove-user-from-team'
import { getGitHubTeamsController } from '~/src/api/teams/controllers/get-github-teams'
import { getTeamByGithubController } from '~/src/api/teams/controllers/get-team-by-github'

export {
  getTeamController,
  getTeamsController,
  createTeamController,
  updateTeamController,
  addUserToTeamController,
  removeUserFromTeamController,
  getGitHubTeamsController,
  getTeamByGithubController
}
