import Joi from 'joi'

const updateTeamValidationSchema = Joi.object({
  name: Joi.string()
    .max(64)
    .regex(/^[A-Za-z0-9-_ ]+$/),
  description: Joi.string()
})

export { updateTeamValidationSchema }
