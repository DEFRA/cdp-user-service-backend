import Joi from 'joi'

import { searchAadUsers } from '../helpers/search-aad-users.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const getAadUsersController = {
  options: {
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
      return h.response(users).code(statusCodes.ok)
    } catch (error) {
      request.logger.error(error, error.message)
      throw error
    }
  }
}

export { getAadUsersController }
