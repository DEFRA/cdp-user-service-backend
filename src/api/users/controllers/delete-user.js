import Joi from 'joi'
import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { deleteUser } from '~/src/api/users/helpers/delete-user'

const deleteUserController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    try {
      await deleteUser(request, request.params?.userId)

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
