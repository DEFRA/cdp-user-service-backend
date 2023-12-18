import Joi from 'joi'

import { updateSharedRepoAccess } from '~/src/api/teams/helpers/update-shared-repo-access'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github-team-exists'

const addTeamToSharedReposController = {
  options: {
    validate: {
      query: Joi.object({
        team: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const team = request.payload.team
    const exists = await gitHubTeamExists(request.octokit, team)
    if (!exists) {
      return h
        .response({ message: `team ${team} does not exist in github` })
        .code(400)
    }

    await updateSharedRepoAccess(request.octokit, team)
    return h.response({ message: 'success' }).code(200)
  }
}

export { addTeamToSharedReposController }
