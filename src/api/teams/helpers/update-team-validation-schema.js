import Joi from 'joi'

const updateTeamValidationSchema = Joi.object({
  name: Joi.string()
    .max(53)
    .regex(/^[A-Za-z0-9-]+$/),
  description: Joi.string().allow(null)
})

export { updateTeamValidationSchema }
