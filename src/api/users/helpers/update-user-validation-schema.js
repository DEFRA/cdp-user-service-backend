import Joi from 'joi'

const updateUserValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  github: Joi.string().allow(null),
  defraVpnId: Joi.string().allow(null),
  defraAwsId: Joi.string().allow(null)
})

export { updateUserValidationSchema }
