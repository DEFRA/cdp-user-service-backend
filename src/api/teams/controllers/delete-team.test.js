import { createServer } from '../../server.js'
import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  teamWithoutUsers,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import {
  deleteMany,
  replaceOne
} from '../../../../test-helpers/mongo-helpers.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

describe('DELETE:/teams/{teamId}', () => {
  let server
  let replaceOneTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()

    server = await createServer()
    await server.initialize()

    replaceOneTestHelper = replaceOne(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  async function deleteTeamEndpoint(url) {
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

  describe('When team id does not exist in the db', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } = await deleteTeamEndpoint(
        '/team/this-team-does-not-exist'
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
      const { statusCode, statusMessage } = deleteTeamResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
    })
  })

  describe('When a team has users', () => {
    let deleteTeamResponse

    beforeEach(async () => {
      await replaceOneTestHelper('users', userAdminFixture)
      await replaceOneTestHelper('teams', platformTeamFixture)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${platformTeamFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
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
      } = await server.inject(`/users/${userAdminFixture._id}`)

      expect(userStatusCode).toBe(200)
      expect(userStatusMessage).toBe('OK')

      expect(userResult).toMatchObject({
        teams: []
      })
    })

    test('Delete team response should be as expected', () => {
      const { statusCode, statusMessage } = deleteTeamResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
    })
  })

  describe('When DB and AAD are out of sync', () => {
    let deleteTeamResponse

    beforeEach(async () => {
      await replaceOneTestHelper('users', userTenantFixture)
      await replaceOneTestHelper('teams', tenantTeamFixture)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${tenantTeamFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper(['users', 'teams'])
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
      } = await server.inject(`/users/${userTenantFixture._id}`)

      expect(userStatusCode).toBe(200)
      expect(userStatusMessage).toBe('OK')

      expect(userResult).toMatchObject({
        teams: []
      })
    })

    test('Delete team response should be as expected', () => {
      const { statusCode, statusMessage } = deleteTeamResponse

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
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
