import Joi from 'joi'
import { environments } from '~/src/config/environments.js'

const updateTeamValidationSchema = Joi.object({
  name: Joi.string()
    .max(53)
    .regex(/^[A-Za-z0-9-]+$/),
  description: Joi.string().allow(null),
  github: Joi.string().allow(null),
  serviceCodes: Joi.array()
    .items(
      Joi.string()
        .min(3)
        .max(3)
        .regex(/^[A-Z]+$/)
    )
    .optional(),
  alertEmailAddresses: Joi.array().items(Joi.string().email()).optional(),
  alertEnvironments: Joi.array()
    .items(Joi.string().valid(...Object.values(environments)))
    .optional()
})

export { updateTeamValidationSchema }
