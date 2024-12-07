import fetchMock from 'jest-fetch-mock'

import { config } from '~/src/config/config.js'
import { createServer } from '~/src/api/server.js'
import { Client } from '@microsoft/microsoft-graph-client'
import { wellKnownResponseFixture } from '~/src/__fixtures__/well-known.js'
import { userOneFixture, userTwoFixture } from '~/src/__fixtures__/users.js'
import {
  platformTeamFixture,
  teamWithoutUsers,
  tenantTeamFixture
} from '~/src/__fixtures__/teams.js'
import { deleteMany, replaceOne } from '~/test-helpers/mongo-helpers.js'

jest.mock('@microsoft/microsoft-graph-client')
jest.mock('@azure/identity')

const oidcWellKnownConfigurationUrl = config.get(
  'oidcWellKnownConfigurationUrl'
)

describe('DELETE:/teams/{teamId}', () => {
  let server
  let mockMsGraph
  let replaceOneTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    fetchMock.enableMocks()

    fetchMock.mockIf(oidcWellKnownConfigurationUrl, () =>
      Promise.resolve(JSON.stringify(wellKnownResponseFixture))
    )

    // Mock MsGraph client
    mockMsGraph = {
      api: jest.fn().mockReturnThis(),
      get: jest.fn(),
      delete: jest.fn()
    }
    Client.initWithMiddleware = () => mockMsGraph

    server = await createServer()
    await server.initialize()

    replaceOneTestHelper = replaceOne(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  afterAll(async () => {
    fetchMock.disableMocks()
    await server.stop({ timeout: 0 })
  })

  async function deleteTeamEndpoint(url) {
    return await server.inject({
      method: 'DELETE',
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [config.get('oidcAdminGroupId')]
        }
      }
    })
  }

  describe('When non UUID passed as teamId param', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } =
        await deleteTeamEndpoint('/teams/not-a-uuid')

      expect(statusCode).toBe(400)
      expect(statusMessage).toBe('Bad Request')

      expect(result).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: '"teamId" must be a valid GUID'
      })
    })
  })

  describe('When team UUID does not exist in the db', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } = await deleteTeamEndpoint(
        '/team/b4c0d7f5-afc7-4dd2-aac5-5467f72a5cfe'
      )

      expect(statusCode).toBe(404)
      expect(statusMessage).toBe('Not Found')

      expect(result).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Not Found'
      })
    })
  })

  describe('When a team does not have any users', () => {
    let deleteTeamResponse

    beforeEach(async () => {
      await replaceOneTestHelper('teams', teamWithoutUsers)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${teamWithoutUsers._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper('teams')
    })

    test('Should have deleted the team from DB', async () => {
      const {
        result: teamResult,
        statusCode: teamStatusCode,
        statusMessage: teamStatusMessage
      } = await server.inject(`/teams/${teamWithoutUsers._id}`)

      expect(teamStatusCode).toBe(404)
      expect(teamStatusMessage).toBe('Not Found')

      expect(teamResult).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Team not found'
      })
    })

    test('Should provide expected delete success response', () => {
      const { result, statusCode, statusMessage } = deleteTeamResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success'
      })
    })
  })

  describe('When a team has users', () => {
    let deleteTeamResponse

    beforeEach(async () => {
      mockMsGraph.get.mockReturnValue({
        value: [{ id: userOneFixture._id }]
      })
      mockMsGraph.delete.mockResolvedValue()

      await replaceOneTestHelper('users', userOneFixture)
      await replaceOneTestHelper('teams', platformTeamFixture)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${platformTeamFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
    })

    test('Should call AAD to get expected members of a group', () => {
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${platformTeamFixture._id}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)
    })

    test('Should call AAD to remove user from a group', () => {
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        2,
        `/groups/${platformTeamFixture._id}/members/${userOneFixture._id}/$ref`
      )
      expect(mockMsGraph.delete).toHaveBeenCalledTimes(1)
    })

    test('Team should have been removed from DB', async () => {
      const {
        result: teamResult,
        statusCode: teamStatusCode,
        statusMessage: teamStatusMessage
      } = await server.inject(`/teams/${platformTeamFixture._id}`)

      expect(teamStatusCode).toBe(404)
      expect(teamStatusMessage).toBe('Not Found')

      expect(teamResult).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Team not found'
      })
    })

    test('User should no longer have team', async () => {
      const {
        result: userResult,
        statusCode: userStatusCode,
        statusMessage: userStatusMessage
      } = await server.inject(`/users/${userOneFixture._id}`)

      expect(userStatusCode).toBe(200)
      expect(userStatusMessage).toBe('OK')

      expect(userResult).toMatchObject({
        message: 'success',
        user: expect.objectContaining({
          teams: []
        })
      })
    })

    test('Delete team response should be as expected', () => {
      const { result, statusCode, statusMessage } = deleteTeamResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success'
      })
    })
  })

  describe('When DB and AAD are out of sync', () => {
    let deleteTeamResponse

    beforeEach(async () => {
      mockMsGraph.get.mockReturnValue({ value: [] })

      await replaceOneTestHelper('users', userTwoFixture)
      await replaceOneTestHelper('teams', tenantTeamFixture)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${tenantTeamFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
    })

    test('Should call AAD to get expected members of a group', () => {
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${tenantTeamFixture._id}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)
    })

    test('Should not call AAD to remove user from a group', () => {
      expect(mockMsGraph.delete).not.toHaveBeenCalled()
    })

    test('Team should have been removed from DB', async () => {
      const {
        result: teamResult,
        statusCode: teamStatusCode,
        statusMessage: teamStatusMessage
      } = await server.inject(`/teams/${tenantTeamFixture._id}`)

      expect(teamStatusCode).toBe(404)
      expect(teamStatusMessage).toBe('Not Found')

      expect(teamResult).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Team not found'
      })
    })

    test('User should no longer have team', async () => {
      const {
        result: userResult,
        statusCode: userStatusCode,
        statusMessage: userStatusMessage
      } = await server.inject(`/users/${userTwoFixture._id}`)

      expect(userStatusCode).toBe(200)
      expect(userStatusMessage).toBe('OK')

      expect(userResult).toMatchObject({
        message: 'success',
        user: expect.objectContaining({
          teams: []
        })
      })
    })

    test('Delete team response should be as expected', () => {
      const { result, statusCode, statusMessage } = deleteTeamResponse

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
        url: `/teams/${platformTeamFixture._id}`
      })

      expect(statusCode).toBe(401)
      expect(statusMessage).toBe('Unauthorized')

      expect(result).toMatchObject({
        message: 'Missing authentication'
      })
    })
  })
})
