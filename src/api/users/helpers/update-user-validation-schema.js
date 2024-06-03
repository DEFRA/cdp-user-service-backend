import Joi from 'joi'

function updateUserValidationSchema(isProduction) {
  return Joi.object({
    email: isProduction
      ? Joi.string().email()
      : Joi.string().email({ tlds: { allow: false } }),
    name: Joi.string(),
    github: Joi.string().allow(null),
    defraVpnId: Joi.string().allow(null),
    defraAwsId: Joi.string().allow(null)
  })
}
export { updateUserValidationSchema }
