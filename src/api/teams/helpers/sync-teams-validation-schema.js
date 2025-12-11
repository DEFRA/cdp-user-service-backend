import Joi from 'joi'
import {
  serviceCodeValidator,
  teamIdValidator,
  teamNameValidator
} from './team-validators.js'

const syncTeamsValidationSchema = Joi.object({
  teams: Joi.array()
    .items(
      Joi.object({
        teamId: teamIdValidator,
        name: teamNameValidator,
        description: Joi.string().allow(null),
        github: Joi.string().allow(null),
        serviceCodes: Joi.array()
          .items(serviceCodeValidator)
          .optional()
          .allow(null)
      })
    )
    .required()
    .min(1)
})

export { syncTeamsValidationSchema }
