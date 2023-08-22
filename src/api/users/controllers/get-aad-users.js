import Joi from 'joi'

import { searchAadUsers } from '~/src/api/users/helpers/search-aad-users'

const getAadUsersController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const users = await searchAadUsers(request.graphClient, query)
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getAadUsersController }