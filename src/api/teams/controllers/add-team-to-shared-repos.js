import Joi from 'joi'

import { addSharedRepoAccess } from '~/src/api/teams/helpers/github/github-shared-repo-access.js'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github/github-team-exists.js'

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

    await addSharedRepoAccess(request.octokit, team)
    return h.response({ message: 'success' }).code(200)
  }
}

export { addTeamToSharedReposController }
