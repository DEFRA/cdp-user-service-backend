import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { updateUserValidationSchema } from '~/src/api/users/helpers/update-user-validation-schema'
import { updateUser } from '~/src/api/users/helpers/update-user'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { getUser } from '~/src/api/users/helpers/get-user'

const updateUserController = {
  options: {
    validate: {
      payload: updateUserValidationSchema
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const existingUser = await getUser(request.db, userId)
    if (isNull(existingUser)) {
      throw Boom.notFound('User not found')
    }

    const updateFields = buildUpdateFields(existingUser, request?.payload, [
      'name',
      'email',
      'github',
      'defraVpnId',
      'defraAwsId'
    ])

    const updatedUser = await updateUser(request.db, userId, updateFields)
    return h.response({ message: 'success', user: updatedUser }).code(200)
  }
}

export { updateUserController }
