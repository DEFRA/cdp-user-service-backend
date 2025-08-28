import Joi from 'joi'
import Boom from '@hapi/boom'

import { deleteUser } from '../../../helpers/mongo/transactions/delete-transactions.js'
import { userIdValidation } from '@defra/cdp-validation-kit'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
      return h.response({ message: 'success' }).code(statusCodes.ok)
    } catch (error) {
      if (error.isBoom) {
        return error
      }

      return Boom.notImplemented('Something went wrong. User not deleted!')
    }
  }
}

export { deleteUserController }
