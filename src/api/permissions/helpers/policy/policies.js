import { environmentValidation } from '@defra/cdp-validation-kit'
import Joi from 'joi'
import { checkDirect, checkPathAny } from './check-relationship.js'

const OR = 'OR'
const AND = 'AND'

const isAdmin = {
  path: ['*', 'granted'],
  resource: 'perm:admin',
  desc: 'has admin permissions'
}

export const policyCanDeployService = {
  name: 'canDeployService',
  context: Joi.resource({
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
        resource: ctx.service,
        desc: 'must own service'
      },
      {
        if: ctx.env === 'ext-test',
        path: ['*', 'granted'],
        resource: 'perm:ext-test',
        desc: 'needs ext-test permissions when deploying to ext-test'
      }
    ]
  ]
}
// - member>owner#service:foo AND >granted#perm:ext-test?env==ext-test
// - granted#perm:admin
//
// [relationship]#[resource]?[when]
// [relationship]: direct|reachable|exact
// direct:       granted#obj
// reachable: >granted#obj
// exact:     path>to>target#obj

export const policyIsAdmin = {
  name: 'isAdmin',
  context: Joi.resource({}),
  conditions: (ctx) => isAdmin
}

const ruleLaunchTerminal = {
  name: 'service:terminal',
  context: Joi.resource({
    service: Joi.string().required(),
    team: Joi.string().required(),
    environment: Joi.string().required()
  }),
  rules: (ctx) => [
    {
      and: [
        isAdmin,
        {
          relation: 'breakglass',
          resource: `team:admin`,
          if: ctx.environment === 'prod',
          desc: 'Must have break-glass for admin'
        }
      ]
    },
    {
      and: [
        { relation: 'owns', resource: ctx.service, desc: 'must own service' },
        {
          // for production, path to service must run via a break-glass relationship as well
          // user:id -->|breakglass| team:id -->|owns| service:id
          path: ['breakglass', 'owns', 'team:admin'],
          resource: `service:${ctx.service}`,
          if: ctx.environment === 'prod',
          desc: 'Must have break-glass for team'
        }
      ]
    }
  ]
}

const codePolicy = {
  name: 'deploy-service',
  apply: async function (ctx) {
    const user = 'user:' + ctx.user
    const team = 'team:' + ctx.team
    const env = ctx.environment

    const isAdmin = await checkPathAny(ctx.db, user, 'permission:admin')
    if (isAdmin) {
      return {
        allow: true,
        reason: 'is admin'
      }
    }

    if (env === 'management' || env === 'infra-dev') {
      return {
        allow: false,
        reason: 'only admins can deploy to this env'
      }
    }

    if (env === 'ext-test') {
      const hasExtTestPermission = await checkPathAny(
        ctx.db,
        user,
        'permission:ext-test'
      )

      if (!hasExtTestPermission) {
        return {
          allow: false,
          reason: 'user requires ext-test permission'
        }
      }
    }

    const isMember = await checkDirect(ctx.db, user, {
      relation: 'member',
      resource: team
    })

    if (isMember) {
      return {
        allow: true,
        reason: 'user is member of team'
      }
    }

    return {
      allow: false,
      reason: 'user does not own this service'
    }
  }
}
