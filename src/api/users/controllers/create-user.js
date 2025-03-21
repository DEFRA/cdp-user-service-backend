import Boom from '@hapi/boom'

import { createUserValidationSchema } from '~/src/api/users/helpers/create-user-validation-schema.js'
import { MongoErrors } from '~/src/helpers/mongodb-errors.js'
import { aadUserIdExists } from '~/src/api/users/helpers/aad-user-id-exists.js'
import { gitHubUserExists } from '~/src/api/users/helpers/github-user-exists.js'
import { createUser } from '~/src/api/users/helpers/create-user.js'

const createUserController = {
  options: {
    tags: ['api', 'users'],
    validate: {
      payload: createUserValidationSchema
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbUser = {
      _id: payload.userId,
      name: payload.name,
      email: payload.email,
      github: payload?.github,
      defraVpnId: payload?.defraVpnId,
      defraAwsId: payload?.defraAwsId
    }

    const aadExists = await aadUserIdExists(request.msGraph, payload.userId)
    if (!aadExists) {
      throw Boom.badData('User does not exist in AAD')
    }

    if (payload?.github) {
      const gitHubExists = await gitHubUserExists(
        request.octokit,
        payload.github
      )
      if (!gitHubExists) {
        throw Boom.badData('User does not exist in GitHub')
      }
    }

    try {
      const user = await createUser(request.db, dbUser)
      return h.response({ message: 'success', user }).code(201)
    } catch (error) {
      if (error?.code === MongoErrors.DuplicateKey) {
        return Boom.conflict('User already exists')
      }
      throw error
    }
  }
}

export { createUserController }
