import Joi from 'joi'
import Boom from '@hapi/boom'

import { deleteUser } from '~/src/helpers/mongo/transactions/delete-transactions.js'

const deleteUserController = {
  options: {
    tags: ['api', 'users'],
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    }
  },
  handler: async (request, h) => {
    try {
      const userId = request.params?.userId
      await deleteUser(request, userId)
      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      if (error.isBoom) {
        return error
      }

      return Boom.notImplemented('Something went wrong. User not deleted!')
    }
  }
}

export { deleteUserController }
