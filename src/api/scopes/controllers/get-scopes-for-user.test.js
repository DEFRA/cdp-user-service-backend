import fetchMock from 'jest-fetch-mock'

import { config } from '~/src/config/index.js'
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
import { userOneFixture, userTwoFixture } from '~/src/__fixtures__/users.js'

const oidcWellKnownConfigurationUrl = config.get(
  'oidcWellKnownConfigurationUrl'
)

describe('GET:/scopes', () => {
  let server

  beforeAll(async () => {
    fetchMock.enableMocks()

    fetchMock.mockIf(oidcWellKnownConfigurationUrl, () =>
      Promise.resolve(JSON.stringify(wellKnownResponseFixture))
    )

    server = await createServer()
    await server.initialize()
  })

  beforeEach(async () => {
    await server.db
      .collection('users')
      .insertMany([userOneFixture, userTwoFixture])

    await server.db
      .collection('teams')
      .insertMany([platformTeamFixture, tenantTeamFixture])
    await server.db
      .collection('scopes')
      .insertMany([
        externalTestScopeFixture,
        postgresScopeFixture,
        terminalScopeFixture,
        breakGlassFixture
      ])
  })

  afterEach(async () => {
    await server.db.collection('users').drop()
    await server.db.collection('teams').drop()
    await server.db.collection('scopes').drop()
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
})
