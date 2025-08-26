import { createServer } from '../../server.js'
import {
  deleteMany,
  replaceMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  prodAccessScopeFixture,
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
  memberWithGranularScopesFixture
} from '../../../__fixtures__/users.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'

describe('GET:/scopes', () => {
  let server
  let replaceManyTestHelper
  let deleteManyTestHelper

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
    await replaceManyTestHelper('users', [
      userAdminFixture,
      userTenantFixture,
      userPostgresFixture,
      userAdminWithTestAsTenantFixture,
      memberWithGranularScopesFixture
    ])
    await replaceManyTestHelper('teams', [
      platformTeamFixture,
      tenantTeamFixture
    ])
    await replaceManyTestHelper('scopes', [
      externalTestScopeFixture,
      postgresScopeFixture,
      terminalScopeFixture,
      prodAccessScopeFixture,
      adminScopeFixture,
      testAsTenantScopeFixture
    ])
  })

  afterEach(async () => {
    await deleteManyTestHelper(['users', 'teams', 'scopes'])
  })

  afterAll(async () => {
    vi.useRealTimers()
    await server.stop({ timeout: 0 })
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
        message: 'success',
        scopes: [
          tenantTeamFixture._id,
          userTenantFixture._id,
          'tenant',
          'terminal'
        ],
        scopeFlags: {
          isAdmin: false,
          isTenant: true
        },
        teamScopes: {
          [tenantTeamFixture._id]: ['serviceOwner']
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
        message: 'success',
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
        message: 'success',
        scopes: [
          '62bb35d2-d4f2-4cf6-abd3-262d99727677',
          platformTeamFixture._id,
          'admin',
          'prodAccess'
        ],
        scopeFlags: {
          isAdmin: true,
          isTenant: false
        },
        teamScopes: {
          [platformTeamFixture._id]: ['serviceOwner']
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
        message: 'success',
        scopes: [
          userAdminWithTestAsTenantFixture._id,
          platformTeamFixture._id,
          'prodAccess',
          'tenant',
          'testAsTenant'
        ],
        scopeFlags: {
          isAdmin: false,
          isTenant: true
        },
        teamScopes: {
          [platformTeamFixture._id]: ['serviceOwner']
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
        message: 'success',
        scopes: [
          tenantTeamFixture._id,
          'postgres',
          'ad760f75-0930-434f-8a4e-174f74723c65',
          'tenant'
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
        message: 'success',
        scopes: [
          '2a45e0cd-9f1b-4158-825d-40e561c55c55',
          '62bb35d2-d4f2-4cf6-abd3-262d997276ee',
          'tenant',
          'testAsTenant'
        ],
        scopeFlags: {
          isAdmin: false,
          isTenant: true
        },
        teamScopes: {
          '2a45e0cd-9f1b-4158-825d-40e561c55c55': [
            'testAsTenant',
            'canGrantProdAccess',
            'serviceOwner'
          ]
        }
      })
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
        message: 'success',
        scopes: [
          '62bb35d2-d4f2-4cf6-abd3-262d99727677',
          'aabe63e7-87ef-4beb-a596-c810631fc474',
          'admin',
          'prodAccess'
        ],
        scopeFlags: {
          isAdmin: true,
          isTenant: false
        },
        teamScopes: {
          'aabe63e7-87ef-4beb-a596-c810631fc474': ['serviceOwner']
        }
      })
    })
  })
})
