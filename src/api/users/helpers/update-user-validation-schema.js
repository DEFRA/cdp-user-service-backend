import Joi from 'joi'

const updateUserValidationSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string(),
  github: Joi.string().allow(null),
  defraVpnId: Joi.string().allow(null),
  defraAwsId: Joi.string().allow(null)
})

export { updateUserValidationSchema }
