import { Client } from '@microsoft/microsoft-graph-client'

import { createServer } from '../../server.js'
import {
  deleteMany,
  replaceOne
} from '../../../../test-helpers/mongo-helpers.js'
import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

vi.mock('@microsoft/microsoft-graph-client')
vi.mock('@azure/identity')

describe('DELETE:/users/{userId}', () => {
  let server
  let mockMsGraph
  let replaceOneTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()

    // Mock MsGraph client
    mockMsGraph = {
      api: vi.fn().mockReturnThis(),
      get: vi.fn(),
      delete: vi.fn()
    }
    Client.initWithMiddleware = () => mockMsGraph

    server = await createServer()
    await server.initialize()

    replaceOneTestHelper = replaceOne(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  async function deleteUserEndpoint(url) {
    return await server.inject({
      method: 'DELETE',
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [scopes.admin]
        }
      }
    })
  }

  describe('When user id does not exist in the db', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } = await deleteUserEndpoint(
        '/users/8469dcf7-846d-43fd-899a-9850bc43298b'
      )

      expect(statusCode).toBe(404)
      expect(statusMessage).toBe('Not Found')

      expect(result).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      })
    })
  })

  describe('When a user exists and is not in any teams', () => {
    let deleteUserResponse

    beforeEach(async () => {
      await replaceOneTestHelper('users', userAdminFixture)
      await replaceOneTestHelper('teams', tenantTeamFixture)

      deleteUserResponse = await deleteUserEndpoint(
        `/users/${userAdminFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
    })

    test('Should have deleted the user from DB', async () => {
      const {
        result: userResult,
        statusCode: userStatusCode,
        statusMessage: userStatusMessage
      } = await server.inject(`/users/${userAdminFixture._id}`)

      expect(userStatusCode).toBe(404)
      expect(userStatusMessage).toBe('Not Found')

      expect(userResult).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      })
    })

    test('Should provide expected delete success response', () => {
      const { result, statusCode, statusMessage } = deleteUserResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success'
      })
    })
  })

  describe('When a user is in a team', () => {
    let deleteUserResponse

    beforeEach(async () => {
      mockMsGraph.get.mockReturnValue({
        value: [{ id: userAdminFixture._id }]
      })
      mockMsGraph.delete.mockResolvedValue()

      await replaceOneTestHelper('users', userAdminFixture)
      await replaceOneTestHelper('teams', platformTeamFixture)

      deleteUserResponse = await deleteUserEndpoint(
        `/users/${userAdminFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
    })

    test('User should have been removed from DB', async () => {
      const {
        result: userResult,
        statusCode: userStatusCode,
        statusMessage: userStatusMessage
      } = await server.inject(`/users/${userAdminFixture._id}`)

      expect(userStatusCode).toBe(404)
      expect(userStatusMessage).toBe('Not Found')

      expect(userResult).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      })
    })

    test('Team should no longer have user', async () => {
      const {
        result: teamResult,
        statusCode: teamStatusCode,
        statusMessage: teamStatusMessage
      } = await server.inject(`/teams/${platformTeamFixture._id}`)

      expect(teamStatusCode).toBe(200)
      expect(teamStatusMessage).toBe('OK')

      expect(teamResult).toMatchObject({
        message: 'success',
        team: expect.objectContaining({
          users: []
        })
      })
    })

    test('Delete user response should be as expected', () => {
      const { result, statusCode, statusMessage } = deleteUserResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success'
      })
    })
  })

  describe('When DB and AAD are out of sync', () => {
    let deleteUserResponse

    beforeEach(async () => {
      mockMsGraph.get.mockReturnValue({ value: [] })

      await replaceOneTestHelper('users', userTenantFixture)
      await replaceOneTestHelper('teams', tenantTeamFixture)

      deleteUserResponse = await deleteUserEndpoint(
        `/users/${userTenantFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
    })

    test('Should not call AAD to remove user from a group', () => {
      expect(mockMsGraph.delete).not.toHaveBeenCalled()
    })

    test('User should have been removed from DB', async () => {
      const {
        result: userResult,
        statusCode: userStatusCode,
        statusMessage: userStatusMessage
      } = await server.inject(`/users/${userTenantFixture._id}`)

      expect(userStatusCode).toBe(404)
      expect(userStatusMessage).toBe('Not Found')

      expect(userResult).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      })
    })

    test('Team should no longer have user', async () => {
      const {
        result: teamResult,
        statusCode: teamStatusCode,
        statusMessage: teamStatusMessage
      } = await server.inject(`/teams/${tenantTeamFixture._id}`)

      expect(teamStatusCode).toBe(200)
      expect(teamStatusMessage).toBe('OK')

      expect(teamResult).toMatchObject({
        message: 'success',
        team: expect.objectContaining({
          users: []
        })
      })
    })

    test('Delete user response should be as expected', () => {
      const { result, statusCode, statusMessage } = deleteUserResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success'
      })
    })
  })

  describe('Without auth', () => {
    test('Should provide expected unauthorized response', async () => {
      const { result, statusCode, statusMessage } = await server.inject({
        method: 'DELETE',
        url: `/users/${userTenantFixture._id}`
      })

      expect(statusCode).toBe(401)
      expect(statusMessage).toBe('Unauthorized')

      expect(result).toMatchObject({
        message: 'Missing authentication'
      })
    })
  })
})
