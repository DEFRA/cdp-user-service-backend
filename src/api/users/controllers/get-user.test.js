import { addHours, subHours } from 'date-fns'
import { createServer } from '../../server.js'
import { userAdminFixture } from '../../../__fixtures__/users.js'
import { collections } from '../../../../test-helpers/constants.js'
import { platformTeamFixture } from '../../../__fixtures__/teams.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import {
  deleteMany,
  replaceOne
} from '../../../../test-helpers/mongo-helpers.js'
import {
  addUserToTeam,
  grantTeamScopedPermissionToUser,
  grantPermissionToUser
} from '../../permissions/helpers/relationships/relationships.js'
import { scopeDefinitions } from '../../../config/scopes.js'

describe('GET:/users/{userId}', () => {
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

  async function getUserEndpoint(url) {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When a user is in the DB', () => {
    beforeEach(async () => {
      await replaceOneTestHelper(collections.user, userAdminFixture)
      await replaceOneTestHelper(collections.team, platformTeamFixture)

      await addUserToTeam(
        server.db,
        userAdminFixture._id,
        platformTeamFixture._id
      )
      await grantPermissionToUser(
        server.db,
        userAdminFixture._id,
        scopeDefinitions.externalTest.scopeId
      )

      await grantTeamScopedPermissionToUser(
        server.db,
        userAdminFixture._id,
        platformTeamFixture._id,
        scopeDefinitions.breakGlass.scopeId,
        subHours(new Date(), 1),
        addHours(new Date(), 1)
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper([collections.user])
      await deleteManyTestHelper([collections.team])
      await deleteManyTestHelper([collections.relationship])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUserEndpoint(
        `/users/${userAdminFixture._id}`
      )

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        name: 'Admin User',
        email: 'admin.user@defra.onmicrosoft.com',
        createdAt: '2023-09-28T13:53:44.948Z',
        updatedAt: '2024-12-03T12:26:28.965Z',
        github: 'AdminUser',
        scopes: [
          {
            scopeId: scopeDefinitions.externalTest.scopeId,
            scopeName: scopeDefinitions.externalTest.scopeId
          }
        ],
        teams: [
          {
            description: 'The team that runs the platform',
            teamId: 'platform',
            name: 'Platform'
          }
        ],
        userId: userAdminFixture._id
      })
    })
  })

  describe('When a user does not exist in the DB', () => {
    test('Should provide expected not found error response', async () => {
      const { result, statusCode, statusMessage } = await getUserEndpoint(
        '/users/this-user-doesnt-exist'
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
})
