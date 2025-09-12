import Joi from 'joi'
import Boom from '@hapi/boom'
import {
  userIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { deleteUserTransaction } from '../../../helpers/mongo/transactions/user/delete-user-transaction.js'

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
      await deleteUserTransaction({ request, userId })

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
