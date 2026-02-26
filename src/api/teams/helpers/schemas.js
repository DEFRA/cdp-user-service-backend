import Joi from 'joi'

import { environments } from '../../../config/environments.js'
import {
  serviceCodeValidator,
  teamIdValidator,
  teamNameValidator
} from './team-validators.js'

const slackChannelsSchema = Joi.object({
  prod: Joi.string().max(80).allow(null),
  nonProd: Joi.string().max(80).allow(null),
  team: Joi.string().max(80).allow(null)
}).unknown(true)

const serviceCodesSchema = Joi.array()
  .items(serviceCodeValidator)
  .optional()
  .allow(null)

const createTeamValidationSchema = Joi.object({
  name: teamNameValidator.required(),
  description: Joi.string().max(256),
  github: Joi.string().optional(),
  serviceCodes: serviceCodesSchema,
  alertEmailAddresses: Joi.array().items(Joi.string().email()).optional(),
  alertEnvironments: Joi.array()
    .items(Joi.string().valid(...Object.values(environments)))
    .optional(),
  slackChannels: slackChannelsSchema.optional().allow(null)
})

const syncTeamsValidationSchema = Joi.object({
  teams: Joi.array()
    .items(
      Joi.object({
        teamId: teamIdValidator,
        name: teamNameValidator,
        description: Joi.string().allow(null),
        github: Joi.string().allow(null),
        serviceCodes: serviceCodesSchema,
        slackChannels: slackChannelsSchema.optional().allow(null)
      })
    )
    .required()
    .min(1)
})

const updateTeamValidationSchema = Joi.object({
  name: teamNameValidator,
  description: Joi.string().allow(null),
  github: Joi.string().allow(null),
  serviceCodes: serviceCodesSchema,
  alertEmailAddresses: Joi.array().items(Joi.string().email()).optional(),
  alertEnvironments: Joi.array()
    .items(Joi.string().valid(...Object.values(environments)))
    .optional(),
  slackChannels: slackChannelsSchema.optional().allow(null)
})

export {
  createTeamValidationSchema,
  syncTeamsValidationSchema,
  updateTeamValidationSchema
}
