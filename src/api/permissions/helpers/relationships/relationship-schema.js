import Joi from 'joi'

const memberSchema = Joi.object({
  subject: Joi.string().required(),
  subjectType: Joi.string().valid('user').required(),
  relation: Joi.string().valid('member').required(),
  resource: Joi.string().required(),
  resourceType: Joi.string().valid('team').required()
})

const grantedSchema = Joi.object({
  subject: Joi.string().required(),
  subjectType: Joi.string().valid('user', 'team').required(),
  relation: Joi.string().valid('granted').required(),
  resource: Joi.string().required(),
  resourceType: Joi.string().valid('permission').required(),
  start: Joi.date().optional(),
  end: Joi.date().optional()
}).and('start', 'end')

const breakGlassSchema = Joi.object({
  subject: Joi.string().required(),
  subjectType: Joi.string().valid('user').required(),
  relation: Joi.string().valid('breakGlass').required(),
  resource: Joi.string().required(),
  resourceType: Joi.string().valid('team').required(),
  start: Joi.date().optional(),
  end: Joi.date().optional()
}).and('start', 'end')

const strictRelationshipSchema = Joi.alternatives([
  memberSchema,
  grantedSchema,
  breakGlassSchema
])

export { strictRelationshipSchema }
