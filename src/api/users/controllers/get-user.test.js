import { createServer } from '../../server.js'
import { userAdminFixture } from '../../../__fixtures__/users.js'
import {
  deleteMany,
  replaceOne
} from '../../../../test-helpers/mongo-helpers.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import { ObjectId } from 'mongodb'
import { platformTeamFixture } from '../../../__fixtures__/teams.js'

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
      await replaceOneTestHelper('users', userAdminFixture)
      await replaceOneTestHelper('teams', platformTeamFixture)
    })

    afterEach(async () => {
      await deleteManyTestHelper('users')
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
            scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
            scopeName: 'breakGlass'
          },
          {
            scopeId: new ObjectId('7751e606a171ebffac3cc9dd'),
            scopeName: 'admin'
          }
        ],
        teams: [
          {
            teamId: 'platform',
            name: 'Platform'
          }
        ],
        userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
        hasBreakGlass: true
      })
    })
  })

  describe('When a user does not exist in the DB', () => {
    test('Should provide expected not found error response', async () => {
      const { result, statusCode, statusMessage } = await getUserEndpoint(
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
})
