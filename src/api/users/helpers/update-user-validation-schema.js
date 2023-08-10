import Joi from 'joi'

const updateUserValidationSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  github: Joi.string().pattern(/^\S+$/),
  defraVpnId: Joi.string().pattern(/^\S+$/),
  defraAwsId: Joi.string().pattern(/^\S+$/)
})

export { updateUserValidationSchema }
