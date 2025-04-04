import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { config } from '~/src/config/config.js'
import { updateUserValidationSchema } from '~/src/api/users/helpers/update-user-validation-schema.js'
import { getUser } from '~/src/api/users/helpers/get-user.js'
import { buildUpdateFields } from '~/src/helpers/build-update-fields.js'
import { gitHubUserExists } from '~/src/api/users/helpers/github-user-exists.js'
import { updateUser } from '~/src/api/users/helpers/update-user.js'
import { requireLock } from '~/src/helpers/mongo-lock.js'

const updateUserController = {
  options: {
    tags: ['api', 'users'],
    validate: {
      payload: updateUserValidationSchema(config.get('isProduction'))
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', '{params.userId}']
      }
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const userId = request.params.userId
    const existingUser = await getUser(request.db, userId)
    if (isNull(existingUser)) {
      throw Boom.notFound('User not found')
    }

    const updateFields = buildUpdateFields(existingUser, payload, [
      'name',
      'email',
      'github',
      'defraVpnId',
      'defraAwsId'
    ])

    if (updateFields?.$set?.github) {
      const gitHubExists = await gitHubUserExists(
        request.octokit,
        payload.github
      )
      if (!gitHubExists) {
        throw Boom.badData('User does not exist in GitHub')
      }
    }

    const lock = await requireLock(request.locker, 'users')
    let updatedUser
    try {
      updatedUser = await updateUser(request.db, userId, updateFields)
    } finally {
      lock.free()
    }
    return h.response({ message: 'success', user: updatedUser }).code(200)
  }
}

export { updateUserController }
