import Boom from '@hapi/boom'

import Joi from '~/src/helpers/extended-joi.js'
import { config } from '~/src/config/config.js'
import { getScope } from '~/src/api/scopes/helpers/get-scope.js'
import { getUser } from '~/src/api/users/helpers/get-user.js'
import { addScopeToUserTransaction } from '~/src/helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'

const adminAddScopeToUserController = {
  options: {
    tags: ['api', 'scopes'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    },
    validate: {
      params: Joi.object({
        userId: Joi.string().guid().required(),
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

    const scope = await addScopeToUserTransaction(request, userId, scopeId)

    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminAddScopeToUserController }
