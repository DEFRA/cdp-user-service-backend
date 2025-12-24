import Joi from 'joi'

import { searchGitHubTeams } from '../helpers/search-github-teams.js'
import { statusCodes } from '@defra/cdp-validation-kit'

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
    return h.response(teams).code(statusCodes.ok)
  }
}

export { getGitHubTeamsController }
