import Joi from 'joi'

import { searchGitHubTeams } from '../helpers/github/search-github-teams.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const getGitHubTeamsController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const teams = await searchGitHubTeams(request.octokit, query)
    return h.response({ message: 'success', teams }).code(statusCodes.ok)
  }
}

export { getGitHubTeamsController }
