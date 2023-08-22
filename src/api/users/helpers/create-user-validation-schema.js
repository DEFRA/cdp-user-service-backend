import Joi from 'joi'

const createUserValidationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  github: Joi.string(),
  defraVpnId: Joi.string(),
  defraAwsId: Joi.string()
})

export { createUserValidationSchema }
