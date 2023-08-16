import Boom from '@hapi/boom'
import { updateUser } from '~/src/api/users/helpers/update-user'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { updateUserValidationSchema } from '~/src/api/users/helpers/update-user-validation-schema'

const updateUserController = {
  options: {
    validate: {
      payload: updateUserValidationSchema
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const fields = ['name', 'email', 'github', 'defraVpnId', 'defraAwsId']
    const updateFields = buildUpdateFields(request?.payload, fields)
    const updateResult = await updateUser(request.db, userId, updateFields)
    if (updateResult.value) {
      const user = normaliseUser(updateResult.value, false)
      return h.response({ message: 'success', user }).code(200)
    } else {
      return Boom.notFound()
    }
  }
}

export { updateUserController }
