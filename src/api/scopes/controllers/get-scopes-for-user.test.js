import { createServer } from '~/src/api/server.js'
import { deleteMany, replaceMany } from '~/test-helpers/mongo-helpers.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '~/src/__fixtures__/teams.js'
import {
  adminFixture,
  breakGlassFixture,
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture
} from '~/src/__fixtures__/scopes.js'
import {
  userAdminFixture,
  userPostgresFixture,
  userTenantFixture
} from '~/src/__fixtures__/users.js'
import { mockWellKnown } from '~/test-helpers/mock-well-known.js'

describe('GET:/scopes', () => {
  let server
  let replaceManyTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
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
      userPostgresFixture
    ])
    await replaceManyTestHelper('teams', [
      platformTeamFixture,
      tenantTeamFixture
    ])
    await replaceManyTestHelper('scopes', [
      externalTestScopeFixture,
      postgresScopeFixture,
      terminalScopeFixture,
      breakGlassFixture,
      adminFixture
    ])
  })

  afterEach(async () => {
    await deleteManyTestHelper(['users', 'teams', 'scopes'])
  })

  afterAll(async () => {
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
        id: userTenantFixture._id,
        scope: [tenantTeamFixture._id]
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        message: 'success',
        scopes: [
          '2a45e0cd-9f1b-4158-825d-40e561c55c55',
          'terminal',
          'postgres',
          userTenantFixture._id,
          'tenant'
        ].sort(),
        scopeFlags: {
          isAdmin: false,
          isTenant: true
        }
      })
    })
  })

  describe('With no id or scope', () => {
    test('Should provide response without flags', async () => {
      const { result, statusCode, statusMessage } = await scopesEndpoint({
        id: null,
        scope: []
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
        id: userAdminFixture._id,
        scope: [platformTeamFixture._id]
      })

      result.scopes.sort()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
      expect(result).toMatchObject({
        message: 'success',
        scopes: [
          userAdminFixture._id,
          platformTeamFixture._id,
          'admin',
          'breakGlass',
          'externalTest'
        ],
        scopeFlags: {
          isAdmin: true,
          isTenant: false
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
        id: userPostgresFixture._id,
        scope: [tenantTeamFixture._id]
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        message: 'success',
        scopes: [
          '2a45e0cd-9f1b-4158-825d-40e561c55c55',
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
})
