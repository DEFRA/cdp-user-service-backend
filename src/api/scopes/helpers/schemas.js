import Joi from 'joi'
import { scopeDefinitions } from '../../../config/scopes.js'

const memberScopes = Object.values(scopeDefinitions)
  .filter((s) => s.kind.includes('member'))
  .map((s) => s.scopeId)

const teamScopes = Object.values(scopeDefinitions)
  .filter((s) => s.kind.includes('team'))
  .map((s) => s.scopeId)

const userScopes = Object.values(scopeDefinitions)
  .filter((s) => s.kind.includes('user'))
  .map((s) => s.scopeId)

const scopeIdValidation = Joi.string().valid(...Object.keys(scopeDefinitions))
const memberOnlyScopeIdValidation = Joi.string().valid(...memberScopes)
const teamScopeIdValidation = Joi.string().valid(...teamScopes)
const userScopeIdValidation = Joi.string().valid(...userScopes)

export {
  scopeIdValidation,
  memberOnlyScopeIdValidation,
  teamScopeIdValidation,
  userScopeIdValidation
}
