import Joi from 'joi'

const validResourceTypes = Joi.string().valid(
  'user',
  'team',
  'permission',
  'entity'
)

const relationshipSchema = Joi.object({
  subject: Joi.string().required(),
  subjectType: validResourceTypes.required(),
  relation: Joi.string().required(),
  resource: Joi.string().required(),
  resourceType: validResourceTypes.required(),
  start: Joi.date(),
  end: Joi.date()
})

export { relationshipSchema, validResourceTypes }
