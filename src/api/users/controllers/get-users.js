import Joi from 'joi'

import { getUsers } from '~/src/api/users/helpers/get-users.js'

const getUsersController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const users = await getUsers(request.db, query)
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getUsersController }
