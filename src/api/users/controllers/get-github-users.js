import Joi from 'joi'

import { searchGitHubUsers } from '~/src/api/users/helpers/search-github-users.js'

const getGitHubUsersController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const users = await searchGitHubUsers(request.octokit, query)
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getGitHubUsersController }
