import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { updateUserValidationSchema } from '~/src/api/users/helpers/update-user-validation-schema'
import { updateUser } from '~/src/api/users/helpers/update-user'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'

const updateUserController = {
  options: {
    validate: {
      payload: updateUserValidationSchema
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const updateFields = buildUpdateFields(request?.payload, [
      'name',
      'email',
      'github',
      'defraVpnId',
      'defraAwsId'
    ])
    const user = await updateUser(request.db, userId, updateFields)
    if (isNull(user)) {
      throw Boom.notFound('User not found')
    }
    return h.response({ message: 'success', user }).code(200)
  }
}

export { updateUserController }
