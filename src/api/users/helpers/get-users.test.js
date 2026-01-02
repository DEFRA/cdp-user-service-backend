import { collections } from '../../../../test-helpers/constants.js'
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { withTestDb } from '../../../../test-helpers/with-test-db.js'
import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import { getUsers } from './get-users.js'
import { getUsersController } from '../controllers/get-users.js'

// Expected results used across tests
const adminUserResult = {
  name: 'Admin User',
  email: 'admin.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'AdminUser',
  scopes: [],
  teams: [],
  userId: userAdminFixture._id
}

const tenantUserResult = {
  name: 'Tenant User',
  email: 'tenant.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:55:42.049Z',
  updatedAt: '2024-07-15T09:56:32.809Z',
  scopes: [],
  teams: [],
  userId: userTenantFixture._id
}

describe('getUsers', () => {
  let db
  let replaceMany
  let deleteMany

  beforeAll(async () => {
    ;({ db, replaceMany, deleteMany } = await withTestDb())
  })

  async function seedTestData() {
    await replaceMany(collections.user, [userAdminFixture, userTenantFixture])
    await replaceMany(collections.team, [
      platformTeamFixture,
      tenantTeamFixture
    ])
  }

  async function cleanupTestData() {
    await deleteMany([collections.user, collections.scope, collections.team])
  }

  describe('helper function', () => {
    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return all users with aggregated data', async () => {
      const result = await getUsers(db)

      expect(result).toEqual([adminUserResult, tenantUserResult])
    })

    test('Should filter by name (case insensitive)', async () => {
      const result = await getUsers(db, 'tenant')

      expect(result).toEqual([tenantUserResult])
    })

    test('Should filter by email', async () => {
      const result = await getUsers(db, 'admin.user@')

      expect(result).toEqual([adminUserResult])
    })

    test('Should return empty array when no users exist', async () => {
      await deleteMany([collections.user])

      const result = await getUsers(db)

      expect(result).toEqual([])
    })
  })

  describe('GET /users endpoint', () => {
    let server

    beforeAll(async () => {
      server = await createTestServer({
        routes: { method: 'GET', path: '/users', ...getUsersController }
      })
    })

    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return 200 with users', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/users'
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual([adminUserResult, tenantUserResult])
    })

    test('Should handle query parameter', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/users?query=tenant'
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual([tenantUserResult])
    })

    test('Should validate query parameter is a string', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/users?query[]=invalid'
      })

      expect(statusCode).toBe(400)
    })
  })
})
