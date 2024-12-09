import fetchMock from 'jest-fetch-mock'

import { config } from '~/src/config/config.js'
import { createServer } from '~/src/api/server.js'
import { wellKnownResponseFixture } from '~/src/__fixtures__/well-known.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '~/src/__fixtures__/teams.js'
import {
  breakGlassFixture,
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture
} from '~/src/__fixtures__/scopes.js'
import {
  userOneFixture,
  userThreeFixture,
  userTwoFixture
} from '~/src/__fixtures__/users.js'
import { deleteMany, replaceMany } from '~/test-helpers/mongo-helpers.js'

const oidcWellKnownConfigurationUrl = config.get(
  'oidcWellKnownConfigurationUrl'
)

describe('GET:/scopes', () => {
  let server
  let replaceManyTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    fetchMock.enableMocks()

    fetchMock.mockIf(oidcWellKnownConfigurationUrl, () =>
      Promise.resolve(JSON.stringify(wellKnownResponseFixture))
    )

    server = await createServer()
    await server.initialize()

    replaceManyTestHelper = replaceMany(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  beforeEach(async () => {
    await replaceManyTestHelper('users', [
      userOneFixture,
      userTwoFixture,
      userThreeFixture
    ])
    await replaceManyTestHelper('teams', [
      platformTeamFixture,
      tenantTeamFixture
    ])
    await replaceManyTestHelper('scopes', [
      externalTestScopeFixture,
      postgresScopeFixture,
      terminalScopeFixture,
      breakGlassFixture
    ])
  })

  afterEach(async () => {
    await deleteManyTestHelper(['users', 'teams', 'scopes'])
  })

  afterAll(async () => {
    fetchMock.disableMocks()
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
        id: userOneFixture._id,
        scope: [tenantTeamFixture._id]
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        message: 'success',
        scopes: [
          '2a45e0cd-9f1b-4158-825d-40e561c55c55',
          'breakGlass',
          'postgres',
          'tenant'
        ],
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
        id: userTwoFixture._id,
        scope: [platformTeamFixture._id]
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        message: 'success',
        scopes: [
          'aabe63e7-87ef-4beb-a596-c810631fc474',
          'terminal',
          'externalTest',
          'admin'
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
        id: userThreeFixture._id,
        scope: [tenantTeamFixture._id]
      })

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toMatchObject({
        message: 'success',
        scopes: ['2a45e0cd-9f1b-4158-825d-40e561c55c55', 'postgres', 'tenant'],
        scopeFlags: {
          isAdmin: false,
          isTenant: true
        }
      })
    })
  })
})
