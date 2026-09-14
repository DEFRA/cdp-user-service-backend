import Joi from 'joi'
import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { getUser } from '../helpers/get-user.js'
import { scopesForUser } from '../../permissions/helpers/relationships/scopes-for-user.js'
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
    const { scopeFlags } = await scopesForUser(
      request.db,
      request.params.userId
    )
    return h.response({ ...user, scopeFlags }).code(statusCodes.ok)
  }
}

export { getUserController }
