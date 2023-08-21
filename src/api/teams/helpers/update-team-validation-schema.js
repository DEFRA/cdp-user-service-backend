import Joi from 'joi'

const updateTeamValidationSchema = Joi.object({
  name: Joi.string()
    .max(53)
    .regex(/^[A-Za-z0-9-]+$/)
    .optional(),
  description: Joi.string().optional()
})

export { updateTeamValidationSchema }
