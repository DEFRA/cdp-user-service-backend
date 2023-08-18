import Joi from 'joi'

const createUserValidationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  github: Joi.string().pattern(/^\S+$/),
  defraVpnId: Joi.string().pattern(/^\S+$/),
  defraAwsId: Joi.string().pattern(/^\S+$/)
})

export { createUserValidationSchema }
