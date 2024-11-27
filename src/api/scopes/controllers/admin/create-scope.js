import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { createScope } from '~/src/api/scopes/helpers/mongo/create-scope.js'

const adminCreateScopeController = {
  options: {
    validate: {
      payload: Joi.object({
        name: Joi.string()
          .max(30)
          .regex(/^[A-Za-z0-9-]+$/)
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

    const scope = await createScope(request.db, {
      name: payload.name,
      description: payload.description
    })

    return h.response({ message: 'success', scope }).code(201)
  }
}

export { adminCreateScopeController }
