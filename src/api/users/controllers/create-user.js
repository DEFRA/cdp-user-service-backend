import Boom from '@hapi/boom'
import { createUser } from '~/src/api/users/helpers/create-user'
import { createUserValidationSchema } from '~/src/api/users/helpers/create-user-validation-schema'
import { getUser } from '~/src/api/users/helpers/get-user'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'
import { MongoErrors } from '~/src/helpers/mongodb-errors'
import { createLogger } from '~/src/helpers/logger'
import { userIdExists } from '~/src/api/users/helpers/user-id-exists'

const logger = createLogger()

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
      const userExists = await userIdExists(request.graphClient, payload.aadId)
      if (!userExists) {
        return Boom.conflict('User does not exist in AAD')
      }
      const createResult = await createUser(request.db, dbUser)
      const userResult = await getUser(request.db, createResult.insertedId)
      const user = normaliseUser(userResult, false)
      logger.info(`Created user ${userResult.aadId} ${userResult.name}`)
      return h.response({ message: 'success', user }).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        return Boom.conflict('User already exists in DB')
      } else {
        throw error
      }
    }
  }
}

export { createUserController }
