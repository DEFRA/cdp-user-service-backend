import { scopes } from '@defra/cdp-validation-kit'

import { createServer } from '../../server.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import { collections } from '../../../../test-helpers/constants.js'
import {
  deleteMany,
  replaceMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  platformTeamFixture,
  teamWithoutUsers,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  breakGlassScopeFixture,
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  testAsTenantScopeFixture
} from '../../../__fixtures__/scopes.js'

import {
  userAdminFixture,
  userAdminWithTestAsTenantFixture,
  userPostgresFixture,
  userTenantFixture,
  memberWithGranularScopesFixture,
  memberWithExpiredBreakGlassFixture
} from '../../../__fixtures__/users.js'

describe('GET:/scopes', () => {
  let server, replaceManyTestHelper, deleteManyTestHelper

  beforeAll(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-08-12T14:16:00.000Z'))
    mockWellKnown()

    server = await createServer()
    await server.initialize()

    replaceManyTestHelper = replaceMany(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  beforeEach(async () => {
    await replaceManyTestHelper(collections.user, [
      userAdminFixture,
      userTenantFixture,
      userPostgresFixture,
      userAdminWithTestAsTenantFixture,
      memberWithGranularScopesFixture,
      memberWithExpiredBreakGlassFixture
    ])
    await replaceManyTestHelper(collections.team, [
      platformTeamFixture,
      tenantTeamFixture,
      teamWithoutUsers
    ])
    await replaceManyTestHelper(collections.scope, [
      externalTestScopeFixture,
      postgresScopeFixture,
      terminalScopeFixture,
      breakGlassScopeFixture,
      adminScopeFixture,
      testAsTenantScopeFixture
    ])
  })

  afterEach(async () => {
    await deleteManyTestHelper([
      collections.user,
      collections.team,
      collections.scope
    ])
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  function scopesEndpoint(credentials) {
    return server.inject({
      method: 'GET',
      url: '/scopes',
      auth: {
        strategy: 'azure-oidc',
        credentials
      }
    })
  }

  describe('With tenant scope', () => {
    test('Should provide response with expected scopes and flags', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: userTenantFixture._id
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        scopes: [
          `team:${tenantTeamFixture._id}`,
          `user:${userTenantFixture._id}`,
          'permission:tenant',
          'permission:serviceOwner:team:animalsandplants',
          'permission:terminal'
        ].sort(),
        scopeFlags: {
          hasBreakGlass: false,
          isAdmin: false,
          isTenant: true
        }
      })
    })
  })

  describe('With no id or scope', () => {
    test('Should provide response without flags', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: null
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        scopes: [],
        scopeFlags: {
          isAdmin: false,
          isTenant: false
        }
      })
    })
  })

  describe('With admin scope', () => {
    test('Should provide response with expected scopes and flags', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: userAdminFixture._id
      })

      result.scopes.sort()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
      expect(result).toEqual({
        scopes: [
          scopes.admin,
          scopes.breakGlass,
          'permission:serviceOwner:team:platform',
          `team:${platformTeamFixture._id}`,
          'user:62bb35d2-d4f2-4cf6-abd3-262d99727677'
        ],
        scopeFlags: {
          isAdmin: true,
          hasBreakGlass: true,
          isTenant: false
        }
      })
    })

    test('Should not provide admin scope when test-as-user is present', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: userAdminWithTestAsTenantFixture._id
      })

      result.scopes.sort()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
      expect(result).toEqual({
        scopes: [
          scopes.breakGlass,
          'permission:serviceOwner:team:platform',
          'permission:tenant',
          'permission:testAsTenant',
          `team:${platformTeamFixture._id}`,
          `user:${userAdminWithTestAsTenantFixture._id}`
        ],
        scopeFlags: {
          hasBreakGlass: true,
          isAdmin: false,
          isTenant: true
        }
      })
    })
  })

  describe('Without auth', () => {
    test('Should provide expected unauthorized response', async () => {
      const { result, statusCode, statusMessage } =
        await server.inject('/scopes')

      expect(statusCode).toBe(401)
      expect(statusMessage).toBe('Unauthorized')

      expect(result).toMatchObject({
        message: 'Missing authentication'
      })
    })
  })

  describe('When team and user have the same scope', () => {
    test('Should provide scopes without duplicates', async () => {
      // User three and Tenant team have the same postgres scope
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: userPostgresFixture._id
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        scopes: [
          `team:${tenantTeamFixture._id}`,
          'permission:serviceOwner:team:animalsandplants',
          'permission:postgres',
          `user:${userPostgresFixture._id}`,
          'permission:tenant'
        ].sort(),
        scopeFlags: {
          isAdmin: false,
          isTenant: true
        }
      })
    })
  })

  describe('With time and team-specific scope', () => {
    test('Should only return scopes where the current date time is within the start and end date of the scope', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: memberWithGranularScopesFixture._id
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        scopes: [
          'permission:canGrantBreakGlass:team:animalsandplants',
          'permission:breakGlass:team:animalsandplants',
          'permission:serviceOwner:team:animalsandplants',
          'permission:tenant',
          'permission:testAsTenant',
          `team:${tenantTeamFixture._id}`,
          'user:62bb35d2-d4f2-4cf6-abd3-262d997276ee'
        ].sort(),
        scopeFlags: {
          hasBreakGlass: false,
          isAdmin: false,
          isTenant: true
        }
      })
    })

    test('Should not return expired scopes', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: memberWithExpiredBreakGlassFixture._id
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        scopes: [
          'permission:canGrantBreakGlass:team:teamwithoutusers',
          'permission:serviceOwner:team:teamwithoutusers',
          'permission:tenant',
          `team:${teamWithoutUsers._id}`,
          `user:${memberWithExpiredBreakGlassFixture._id}`
        ].sort(),
        scopeFlags: {
          hasBreakGlass: false,
          isAdmin: false,
          isTenant: true
        }
      })

      expect(result.scopes).not.toContain(
        'permission:breakGlass:team:teamwithoutusers'
      )
      expect(result.scopes).not.toContain('permission:breakGlass')
    })
  })

  describe('Without time and team-specific scope', () => {
    test('Should only return scopes', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: userAdminFixture._id
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        scopes: [
          scopes.admin,
          scopes.breakGlass,
          'permission:serviceOwner:team:platform',
          `team:${platformTeamFixture._id}`,
          `user:${userAdminFixture._id}`
        ],
        scopeFlags: {
          hasBreakGlass: true,
          isAdmin: true,
          isTenant: false
        }
      })
    })
  })
})
