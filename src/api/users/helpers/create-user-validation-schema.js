import Joi from 'joi'

const createUserValidationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  github: Joi.string().optional(),
  defraVpnId: Joi.string().optional(),
  defraAwsId: Joi.string().optional()
})

export { createUserValidationSchema }
