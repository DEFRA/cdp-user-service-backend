import { scopes } from '@defra/cdp-validation-kit'
import { collections } from '../../../../test-helpers/constants.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
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
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { teams } from '../routes.js'
import { addUserToTeam } from '../../permissions/helpers/relationships/relationships.js'
import { users } from '../../users/routes.js'

describe('DELETE:/teams/{teamId}', () => {
  let server
  let replaceOneTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()
    server = await createTestServer({ plugins: [teams, users] })
    await server.initialize()

    replaceOneTestHelper = replaceOne(server.db)
    deleteManyTestHelper = deleteMany(server.db)
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
    test('Should provide 404 error response', async () => {
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
      await replaceOneTestHelper(collections.team, teamWithoutUsers)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${teamWithoutUsers._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper([
        collections.team,
        collections.user,
        collections.relationship
      ])
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
      await replaceOneTestHelper(collections.user, userAdminFixture)
      await replaceOneTestHelper(collections.team, platformTeamFixture)
      await addUserToTeam(
        server.db,
        userAdminFixture._id,
        platformTeamFixture._id
      )

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${platformTeamFixture._id}`
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper([
        collections.user,
        collections.team,
        collections.relationship
      ])
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
      await replaceOneTestHelper(collections.user, userTenantFixture)
      await replaceOneTestHelper(collections.team, tenantTeamFixture)

      deleteTeamResponse = await deleteTeamEndpoint(
        `/teams/${tenantTeamFixture._id}`
      )
    })

    afterAll(async () => {
      await deleteManyTestHelper([
        collections.user,
        collections.team,
        collections.relationship
      ])
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
