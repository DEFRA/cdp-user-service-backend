import Joi from '../../../../helpers/extended-joi.js'
import Boom from '@hapi/boom'

import { updateScope } from '../../helpers/update-scope.js'
import { scopeExists } from '../../helpers/scope-exists.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const adminUpdateScopeController = {
  options: {
    validate: {
      params: Joi.object({
        scopeId: Joi.objectId().required()
      }),
      payload: Joi.object({
        kind: Joi.array()
          .items(Joi.string())
          .has(Joi.string().valid('user', 'team'))
          .required(),
        description: Joi.string().optional().max(256)
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    const payload = request.payload
    const params = request.params
    const scopeId = params.scopeId

    const existingScope = await scopeExists(request.db, scopeId)
    if (!existingScope) {
      return Boom.conflict('Scope does not exist!')
    }

    const scope = await updateScope(request.db, scopeId, {
      kind: payload.kind,
      description: payload.description
    })

    return h.response({ message: 'success', scope }).code(statusCodes.ok)
  }
}

export { adminUpdateScopeController }
