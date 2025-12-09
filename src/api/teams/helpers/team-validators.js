import Joi from 'joi'

const teamIdentifierMaxLength = 53

const teamNameValidator = Joi.string()
  .max(teamIdentifierMaxLength)
  .regex(/^[A-Za-z0-9-]+$/)

const teamIdValidator = Joi.string()
  .max(teamIdentifierMaxLength)
  .regex(/^[a-z0-9-]+$/)

const serviceCodeValidator = Joi.string()
  .min(3)
  .max(3)
  .regex(/^[A-Z]+$/)

export { teamNameValidator, teamIdValidator, serviceCodeValidator }
