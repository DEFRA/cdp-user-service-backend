import Joi from 'joi'
import { memberScopeIds } from '../../../../config/scopes.js'

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

const teamScopedGrantsSchema = Joi.object({
  subject: Joi.string().required(),
  subjectType: Joi.string().valid('user').required(),
  relation: Joi.string()
    .valid(...[...memberScopeIds])
    .required(),
  resource: Joi.string().required(),
  resourceType: Joi.string().valid('team').required(),
  start: Joi.date().optional(),
  end: Joi.date().optional()
}).and('start', 'end')

const strictRelationshipSchema = Joi.alternatives([
  memberSchema,
  grantedSchema,
  teamScopedGrantsSchema
])

export { strictRelationshipSchema }
