import Joi from 'joi'
import Boom from '@hapi/boom'
import { UTCDate } from '@date-fns/utc'

import {
  scopes,
  statusCodes,
  userIdValidation
} from '@defra/cdp-validation-kit'
import { requireLock } from '../../../helpers/mongo-lock.js'
import { enableUser } from '../helpers/enable-user.js'
import { getUserOnly } from '../helpers/get-user.js'
import { recordAudit } from '../../../helpers/audit/record-audit.js'

const enableUserController = {
  options: {
    validate: {
      params: Joi.object({
        userId: userIdValidation
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const existingUser = await getUserOnly(request.db, userId)

    if (!existingUser) {
      throw Boom.notFound('User not found')
    }

    const lock = await requireLock(request.locker, 'users')
    let updatedUser
    try {
      updatedUser = await enableUser(request.db, userId)
    } finally {
      lock.free()
    }

    await recordAudit({
      category: 'user',
      action: 'Enabled',
      performedBy: {
        id: request.auth.credentials.id,
        displayName: request.auth.credentials.displayName
      },
      performedAt: new UTCDate(),
      details: {
        user: {
          userId,
          displayName: existingUser.name
        }
      }
    })

    return h.response(updatedUser).code(statusCodes.ok)
  }
}

export { enableUserController }
