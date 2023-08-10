import Boom from '@hapi/boom'
import { createUser } from '~/src/api/users/helpers/create-user'
import { createUserValidationSchema } from '~/src/api/users/helpers/create-user-validation-schema'
import { getUser } from '~/src/api/users/helpers/get-user'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

const createUserController = {
  options: {
    validate: {
      payload: createUserValidationSchema
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbUser = {
      _id: payload.aadId,
      name: payload.name,
      email: payload.email,
      github: payload?.github,
      defraVpnId: payload?.defraVpnId,
      defraAwsId: payload?.defraAwsId
    }
    try {
      const createResult = await createUser(request.db, dbUser)
      const userResult = await getUser(request.db, createResult.insertedId)
      const user = normaliseUser(userResult)
      return h.response({ message: 'success', user }).code(201)
    } catch (error) {
      if (error.code === 11000) {
        return Boom.conflict('User already exists')
      } else {
        throw error
      }
    }
  }
}

export { createUserController }
