import Joi from 'joi'

import { searchGitHubUsers } from '../helpers/search-github-users.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
    return h.response(users).code(statusCodes.ok)
  }
}

export { getGitHubUsersController }
