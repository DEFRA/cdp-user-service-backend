import Joi from 'joi'
import { userIdValidation } from '@defra/cdp-validation-kit'

const createUserValidationSchema = Joi.object({
  userId: userIdValidation,
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  github: Joi.string()
})

export { createUserValidationSchema }
