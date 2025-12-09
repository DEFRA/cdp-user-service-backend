import Joi from 'joi'
import { environments } from '../../../config/environments.js'
import { serviceCodeValidator, teamNameValidator } from './team-validators.js'

const updateTeamValidationSchema = Joi.object({
  name: teamNameValidator,
  description: Joi.string().allow(null),
  github: Joi.string().allow(null),
  serviceCodes: Joi.array().items(serviceCodeValidator).optional(),
  alertEmailAddresses: Joi.array().items(Joi.string().email()).optional(),
  alertEnvironments: Joi.array()
    .items(Joi.string().valid(...Object.values(environments)))
    .optional()
})

export { updateTeamValidationSchema }
