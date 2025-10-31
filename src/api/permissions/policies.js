import { environmentValidation } from '@defra/cdp-validation-kit'
import Joi from 'joi'

const OR = 'OR'
const AND = 'AND'

const isAdmin = { path: ['*', 'granted'], object: 'perm:admin', desc: 'has admin permissions' }

export const policyCanDeployService = {
  name: 'canDeployService',
  context: Joi.object({
    service: Joi.string().required(),
    env: environmentValidation.required()
  }),
  conditions: (ctx) => [
    OR,
    isAdmin,
    [
      AND,
      {
        path: ['member', 'owner'],
        object: ctx.service,
        desc: 'must own service'
      },
      {
        if: ctx.env === 'ext-test',
        path: ['*', 'granted'],
        object: 'perm:ext-test',
        desc: 'needs ext-test permissions when deploying to ext-test'
      }
    ]
  ]
}
// - member>owner#service:foo AND >granted#perm:ext-test?env==ext-test
// - granted#perm:admin
//
// [relationship]#[object]?[when]
// [relationship]: direct|reachable|exact
// direct:       granted#obj
// reachable: >granted#obj
// exact:     path>to>target#obj

export const policyIsAdmin = {
  name: 'isAdmin',
  context: Joi.object({}),
  conditions: (ctx) => isAdmin
}
