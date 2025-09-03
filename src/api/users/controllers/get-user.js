import Joi from 'joi'
import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { getUser } from '../helpers/get-user.js'
import { userIdValidation, statusCodes } from '@defra/cdp-validation-kit'

const getUserController = {
  options: {
    validate: {
      params: Joi.object({
        userId: userIdValidation
      })
    }
  },
  handler: async (request, h) => {
    const user = await getUser(request.db, request.params.userId)
    if (isNull(user)) {
      throw Boom.notFound('User not found')
    }
    return h.response(user).code(statusCodes.ok)
  }
}

export { getUserController }
