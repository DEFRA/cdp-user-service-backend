import Joi from 'joi'

const updateUserValidationSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  github: Joi.string().optional(),
  defraVpnId: Joi.string().optional(),
  defraAwsId: Joi.string().optional()
})

export { updateUserValidationSchema }
