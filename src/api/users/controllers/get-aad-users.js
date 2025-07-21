import Joi from 'joi'

import { searchAadUsers } from '../helpers/search-aad-users.js'

const getAadUsersController = {
  options: {
    tags: ['api', 'users'],
    validate: {
      query: Joi.object({
        query: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    try {
      const query = request.query.query
      const users = await searchAadUsers(request.msGraph, query)
      return h.response({ message: 'success', users }).code(200)
    } catch (error) {
      request.logger.error(error, error.message)
      throw error
    }
  }
}

export { getAadUsersController }
