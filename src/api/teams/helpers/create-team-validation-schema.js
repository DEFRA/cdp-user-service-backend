import Joi from 'joi'
import { environments } from '../../../config/environments.js'
import { serviceCodeValidator, teamNameValidator } from './team-validators.js'

const createTeamValidationSchema = Joi.object({
  name: teamNameValidator.required(),
  description: Joi.string().max(256),
  github: Joi.string().optional(),
  serviceCodes: Joi.array().items(serviceCodeValidator).optional(),
  alertEmailAddresses: Joi.array().items(Joi.string().email()).optional(),
  alertEnvironments: Joi.array()
    .items(Joi.string().valid(...Object.values(environments)))
    .optional()
})

export { createTeamValidationSchema }
