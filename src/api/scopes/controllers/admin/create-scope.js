import Joi from 'joi'
import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { createScope } from '~/src/api/scopes/helpers/mongo/create-scope.js'
import { scopeNameExists } from '~/src/api/scopes/helpers/mongo/scope-name-exists.js'

const adminCreateScopeController = {
  options: {
    validate: {
      payload: Joi.object({
        value: Joi.string()
          .max(40)
          .regex(/^[A-Za-z0-9]+$/)
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
      description: payload.description
    })

    return h.response({ message: 'success', scope }).code(201)
  }
}

export { adminCreateScopeController }