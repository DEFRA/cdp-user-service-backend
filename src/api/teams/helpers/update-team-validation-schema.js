import Joi from 'joi'

const updateTeamValidationSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string()
})

export { updateTeamValidationSchema }
