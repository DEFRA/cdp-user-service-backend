import Joi from 'joi'
import Boom from '@hapi/boom'

import { deleteUser } from '../../../helpers/mongo/transactions/delete-transactions.js'
import {
  userIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

const deleteUserController = {
  options: {
    validate: {
      params: Joi.object({
        userId: userIdValidation
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    try {
      const userId = request.params?.userId
      await deleteUser(request, userId)
      return h.response().code(statusCodes.ok)
    } catch (error) {
      if (error.isBoom) {
        return error
      }

      return Boom.notImplemented('Something went wrong. User not deleted!')
    }
  }
}

export { deleteUserController }
