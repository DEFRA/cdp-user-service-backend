import Joi from 'joi'

import { addSharedRepoAccess } from '../helpers/github/github-shared-repo-access.js'
import { gitHubTeamExists } from '../helpers/github/github-team-exists.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
        .code(statusCodes.badRequest)
    }

    await addSharedRepoAccess(request.octokit, team)
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}

export { addTeamToSharedReposController }
