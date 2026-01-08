import Joi from 'joi'
import { scopeDefinitions } from '../../../../config/scopes.js'

const memberOfSchema = Joi.object({
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

const memberScopeIds = Object.values(scopeDefinitions)
  .filter((s) => s.kind.includes('member'))
  .map((s) => s.scopeId)

const teamScopedGrantsSchema = Joi.object({
  subject: Joi.string().required(),
  subjectType: Joi.string().valid('user').required(),
  relation: Joi.string()
    .valid(...memberScopeIds)
    .required(),
  resource: Joi.string().required(),
  resourceType: Joi.string().valid('team').required(),
  start: Joi.date().optional(),
  end: Joi.date().optional()
}).and('start', 'end')

const strictRelationshipSchema = Joi.alternatives([
  memberOfSchema,
  grantedSchema,
  teamScopedGrantsSchema
])

export { strictRelationshipSchema }
