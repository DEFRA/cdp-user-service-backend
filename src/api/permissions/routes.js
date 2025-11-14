import { getScopesForUserController } from './controllers/get-scopes-for-user.js'
import { getActiveBreakGlassScopeForUser } from './controllers/get-active-break-glass-scope-for-user.js'

import { drawPerms , backfill } from './permissions.js'
import {backfill, drawPerms, getPerms} from './permissions.js'
import { policyCanDeployService } from './policies.js'
import { canAccess } from './eval.js'
import {scopesForUser} from "../scopes/helpers/scopes-for-user.js";

const permissions = {
  plugin: {
    name: 'permissions',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/scopes',
          ...getScopesForUserController
        },
        {
          method: 'GET',
          path: '/scopes/active-break-glass',
          ...getActiveBreakGlassScopeForUser
        },
        {
          method: 'GET',
          path: '/auth/debug',
          ...debug
        },
        {
          method: 'GET',
          path: '/auth/backfill',
          ...backfillController
        },
        {
          method: 'GET',
          path: '/auth/perms',
          ...perms
        },
        {
          method: 'GET',
          path: '/auth/graph',
          ...graph
        }
      ])
    }
  }
}

const backfillController = {
  options: {},
  handler: async (request, h) => {
    await backfill(request.db)
    return h.response({}).code(200)
  }
}

const debug = {
  options: {},
  handler: async (request, h) => {
    const user = 'user:Phil.Hargreaves@defra.gov.uk'
    const input = { service: 'service:cdp-portal-backend', env: 'dev' }
    //await drawPerms(request.db, user)

    const result = await canAccess(
      request.db,
      user,
      policyCanDeployService,
      input
    )

    return h
      .response({
        policy: policyCanDeployService.name,
        input,
        user,
        allow: result
      })
      .code(200)
  }
}

const perms = {
  options: {},
  handler: async (request, h) => {
    const user = request.query.user

    const v2Perms = await getPerms(request.db, user)
    const v1Perms = await  scopesForUser({id: user}, request.db)
    return h
      .response({v2:v2Perms, v1: v1Perms})
      .code(200)
  }
}

const graph = {
  options: {},
  handler: async (request, h) => {
    const user = request.query.user

    const mermaid = await drawPerms(request.db, `user:${user}`)
    return h
      .response(mermaid)
      .code(200)
  }
}

export { permissions }
