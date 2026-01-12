import Joi from 'joi'
import Boom from '@hapi/boom'
import {
  userIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { deleteUserRelationships } from '../../permissions/helpers/relationships/relationships.js'
import { deleteUser } from '../helpers/delete-user.js'

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
      const deleted = await deleteUser(request.db, userId)
      await deleteUserRelationships(request.db, userId)
      if (!deleted) {
        return Boom.notFound('User not found')
      }
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
