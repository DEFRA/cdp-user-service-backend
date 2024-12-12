import Joi from 'joi'
import Boom from '@hapi/boom'

import { config } from '~/src/config/config.js'
import { createScope } from '~/src/api/scopes/helpers/create-scope.js'
import { scopeNameExists } from '~/src/api/scopes/helpers/scope-name-exists.js'

const adminCreateScopeController = {
  options: {
    tags: ['api', 'scopes'],
    validate: {
      payload: Joi.object({
        value: Joi.string()
          .min(3)
          .max(53)
          .regex(/^[A-Za-z0-9]+$/)
          .required(),
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
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const userId = request.auth.credentials.id

    const scopeExists = await scopeNameExists(request.db, payload.value)
    if (scopeExists) {
      return Boom.conflict('Scope already exists!')
    }

    const scope = await createScope(request.db, {
      userId,
      value: payload.value,
      kind: payload.kind,
      description: payload.description
    })

    return h.response({ message: 'success', scope }).code(201)
  }
}

export { adminCreateScopeController }
