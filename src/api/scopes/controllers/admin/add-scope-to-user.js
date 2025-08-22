import Boom from '@hapi/boom'

import Joi from '../../../../helpers/extended-joi.js'
import { getScope } from '../../helpers/get-scope.js'
import { getUser } from '../../../users/helpers/get-user.js'
import { addScopeToUserTransaction } from '../../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'
import { userIdValidation } from '@defra/cdp-validation-kit'

const adminAddScopeToUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        userId: userIdValidation,
        scopeId: Joi.objectId().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const userId = request.params.userId
    const scopeId = request.params.scopeId

    const dbUser = await getUser(request.db, userId)
    const dbScope = await getScope(request.db, scopeId)

    if (!dbUser) {
      throw Boom.notFound('User not found')
    }

    if (!dbScope) {
      throw Boom.notFound('Scope not found')
    }

    if (!dbScope.kind.includes('user')) {
      throw Boom.badRequest('Scope cannot be applied to a user')
    }

    const scope = await addScopeToUserTransaction(request, userId, scopeId)

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminAddScopeToUserController }
