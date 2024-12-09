import Joi from 'joi'
import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { getUser } from '~/src/api/users/helpers/get-user.js'

const getUserController = {
  options: {
    tags: ['api', 'users'],
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const user = await getUser(request.db, request.params.userId)
    if (isNull(user)) {
      throw Boom.notFound('User not found')
    }
    return h.response({ message: 'success', user }).code(200)
  }
}

export { getUserController }
