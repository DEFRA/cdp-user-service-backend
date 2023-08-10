import { updateUser } from '~/src/api/users/helpers/update-user'
import { updateUserValidationSchema } from '~/src/api/users/helpers/update-user-validation-schema'
import Boom from '@hapi/boom'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

const updateUserController = {
  options: {
    validate: {
      payload: updateUserValidationSchema
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const fields = ['name', 'email', 'github', 'defraVpnId', 'defraAwsId']
    const updateFields = Object.fromEntries(
      Object.entries(request?.payload)
        .filter(
          ([field, value]) => fields.includes(field) && value !== undefined
        )
        .map(([field, value]) => [field, value])
    )
    const updateResult = await updateUser(request.db, userId, updateFields)
    if (updateResult.value) {
      const user = normaliseUser(updateResult.value)
      return h.response({ message: 'success', user }).code(200)
    } else {
      return Boom.notFound()
    }
  }
}

export { updateUserController }
