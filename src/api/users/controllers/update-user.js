import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { config } from '~/src/config'
import { updateUserValidationSchema } from '~/src/api/users/helpers/update-user-validation-schema'
import { getUser } from '~/src/api/users/helpers/get-user'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { gitHubUserExists } from '~/src/api/users/helpers/github-user-exists'
import { updateUser } from '~/src/api/users/helpers/update-user'

const updateUserController = {
  options: {
    validate: {
      payload: updateUserValidationSchema
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('azureAdminGroupId'), '{params.userId}']
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

    const updatedUser = await updateUser(request.db, userId, updateFields)
    return h.response({ message: 'success', user: updatedUser }).code(200)
  }
}

export { updateUserController }
