import Joi from 'joi'
import { environments } from '../../../config/environments.js'

const createTeamValidationSchema = Joi.object({
  name: Joi.string()
    .max(53)
    .regex(/^[A-Za-z0-9-]+$/)
    .required(),
  description: Joi.string().max(256),
  github: Joi.string().optional(),
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

export { createTeamValidationSchema }
