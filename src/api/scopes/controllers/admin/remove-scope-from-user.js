import Boom from '@hapi/boom'

import { config } from '~/src/config/config.js'
import Joi from '~/src/helpers/extended-joi.js'
import { removeScopeFromUserTransaction } from '~/src/helpers/mongo/transactions/scope/remove-scope-from-user-transaction.js'

const adminRemoveScopeFromUserController = {
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

    const scope = await removeScopeFromUserTransaction(request, userId, scopeId)
    return h.response({ message: 'success', scope }).code(200)
  }
}

export { adminRemoveScopeFromUserController }
