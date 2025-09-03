import Joi from 'joi'

import { getUsers } from '../helpers/get-users.js'
import { statusCodes } from '@defra/cdp-validation-kit'

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
    return h.response(users).code(statusCodes.ok)
  }
}

export { getUsersController }
