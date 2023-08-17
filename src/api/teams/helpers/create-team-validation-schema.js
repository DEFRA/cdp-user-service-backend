import Joi from 'joi'

const createTeamValidationSchema = Joi.object({
  name: Joi.string()
    .max(64)
    .regex(/^[A-Za-z0-9-_ ]+$/)
    .required(),
  description: Joi.string()
})

export { createTeamValidationSchema }
