import { collections } from '../../../../test-helpers/constants.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import {
  deleteMany,
  replaceMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import { scopeDefinitions } from '../../../config/scopes.js'
import {
  addUserToTeam,
  grantPermissionToUser
} from '../../permissions/helpers/relationships/relationships.js'
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { users } from '../routes.js'

const adminUser = {
  name: 'Admin User',
  email: 'admin.user@defra.onmicrosoft.com',
  github: 'AdminUser',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  teams: [
    {
      teamId: 'platform',
      name: 'Platform',
      description: 'The team that runs the platform'
    }
  ],
  scopes: [
    { scopeId: 'admin', scopeName: 'admin' },
    { scopeId: 'breakGlass', scopeName: 'breakGlass' }
  ],
  userId: '62bb35d2-0000-0000-0000-262d99727677'
}

const tenantUser = {
  name: 'Tenant User',
  email: 'tenant.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:55:42.049Z',
  updatedAt: '2024-07-15T09:56:32.809Z',
  scopes: [
    {
      scopeId: scopeDefinitions.externalTest.scopeId,
      scopeName: scopeDefinitions.externalTest.scopeId
    }
  ],
  teams: [
    {
      description: 'A team for the animals and plants',
      teamId: 'animalsandplants',
      name: 'AnimalsAndPlants'
    }
  ],
  userId: 'b7606810-ffff-ffff-ffff-ba730ef706e8'
}

describe('GET:/users', () => {
  let server
  let replaceManyTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()

    server = await createTestServer({ plugins: [users] })
    await server.initialize()

    replaceManyTestHelper = replaceMany(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  async function getUsersEndpoint(url = '/users') {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When users are in the DB', () => {
    beforeEach(async () => {
      await replaceManyTestHelper(collections.user, [
        userAdminFixture,
        userTenantFixture
      ])
      await replaceManyTestHelper(collections.team, [
        platformTeamFixture,
        tenantTeamFixture
      ])
      await addUserToTeam(
        server.db,
        userAdminFixture._id,
        platformTeamFixture._id
      )
      await addUserToTeam(
        server.db,
        userTenantFixture._id,
        tenantTeamFixture._id
      )
      await grantPermissionToUser(
        server.db,
        userAdminFixture._id,
        scopeDefinitions.admin.scopeId
      )
      await grantPermissionToUser(
        server.db,
        userAdminFixture._id,
        scopeDefinitions.breakGlass.scopeId
      )
      await grantPermissionToUser(
        server.db,
        userTenantFixture._id,
        scopeDefinitions.externalTest.scopeId
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper([collections.user])
      await deleteManyTestHelper([collections.team])
      await deleteManyTestHelper([collections.relationship])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUsersEndpoint()
      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
      expect(result).toEqual([adminUser, tenantUser])
    })

    describe('When query param is used', () => {
      test('With a name value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=tenant'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')
        expect(result).toEqual([tenantUser])
      })

      test('With an email value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=admin.user@'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')
        expect(result).toEqual([adminUser])
      })
    })
  })

  describe('When NO users are in the DB', () => {
    beforeEach(async () => {
      await deleteManyTestHelper([collections.user])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUsersEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual([])
    })
  })
})
