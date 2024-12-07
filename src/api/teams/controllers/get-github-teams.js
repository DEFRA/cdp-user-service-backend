import Joi from 'joi'

import { searchGitHubTeams } from '~/src/api/teams/helpers/github/search-github-teams.js'

const getGitHubTeamsController = {
  options: {
    tags: ['api', 'teams'],
    validate: {
      query: Joi.object({
        query: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const teams = await searchGitHubTeams(request.octokit, query)
    return h.response({ message: 'success', teams }).code(200)
  }
}

export { getGitHubTeamsController }
