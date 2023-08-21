import Joi from 'joi'

const createUserValidationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  name: Joi.string().allow(null),
  github: Joi.string().allow(null),
  defraVpnId: Joi.string().allow(null),
  defraAwsId: Joi.string().allow(null)
})

export { createUserValidationSchema }
