import Joi from 'joi'

const createTeamValidationSchema = Joi.object({
  teamId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  description: Joi.string()
})

export { createTeamValidationSchema }
