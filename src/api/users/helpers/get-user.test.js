import { ObjectId } from 'mongodb'

import { collections } from '../../../../test-helpers/constants.js'
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { withTestDb } from '../../../../test-helpers/with-test-db.js'
import { userAdminFixture } from '../../../__fixtures__/users.js'
import { platformTeamFixture } from '../../../__fixtures__/teams.js'
import { getUser } from './get-user.js'
import { getUserController } from '../controllers/get-user.js'

const adminUserResult = {
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
  teams: [{ teamId: 'platform', name: 'Platform' }],
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  hasBreakGlass: true
}

describe('getUser', () => {
  let db
  let replaceOne
  let deleteMany

  beforeAll(async () => {
    ;({ db, replaceOne, deleteMany } = await withTestDb())
  })

  async function seedTestData() {
    await replaceOne(collections.user, userAdminFixture)
    await replaceOne(collections.team, platformTeamFixture)
  }

  async function cleanupTestData() {
    await deleteMany([collections.user, collections.team])
  }

  describe('helper function', () => {
    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return user with aggregated data', async () => {
      const result = await getUser(db, userAdminFixture._id)

      expect(result).toEqual(adminUserResult)
    })

    test('Should return null when user does not exist', async () => {
      const result = await getUser(db, 'non-existent-user-id')

      expect(result).toBeNull()
    })
  })

  describe('GET /users/{userId} endpoint', () => {
    let server

    beforeAll(async () => {
      server = await createTestServer({
        routes: { method: 'GET', path: '/users/{userId}', ...getUserController }
      })
    })

    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return 200 with user data', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: `/users/${userAdminFixture._id}`
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(adminUserResult)
    })

    test('Should return 404 when user does not exist', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/users/8469dcf7-846d-43fd-899a-9850bc43298b'
      })

      expect(statusCode).toBe(404)
      expect(result).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      })
    })
  })
})
