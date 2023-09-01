import Joi from 'joi'

import { searchGitHubTeams } from '~/src/api/teams/helpers/search-github-teams'

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
    const users = await searchGitHubTeams(request.octokit, query)
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getGitHubTeamsController }
