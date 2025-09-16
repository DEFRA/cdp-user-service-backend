import { ObjectId } from 'mongodb'

import { createServer } from '../../server.js'
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
  adminScopeFixture,
  breakGlassScopeFixture,
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  testAsTenantScopeFixture
} from '../../../__fixtures__/scopes.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'

describe('GET:/users', () => {
  let server
  let replaceManyTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()

    server = await createServer()
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
      await replaceManyTestHelper(collections.scope, [
        externalTestScopeFixture,
        postgresScopeFixture,
        terminalScopeFixture,
        breakGlassScopeFixture,
        adminScopeFixture,
        testAsTenantScopeFixture
      ])
    })

    afterEach(async () => {
      await deleteManyTestHelper([collections.user])
      await deleteManyTestHelper([collections.scope])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUsersEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual([
        {
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
        },
        {
          name: 'Tenant User',
          email: 'tenant.user@defra.onmicrosoft.com',
          createdAt: '2023-09-28T13:55:42.049Z',
          updatedAt: '2024-07-15T09:56:32.809Z',
          scopes: [
            {
              scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'),
              scopeName: 'terminal'
            }
          ],
          teams: [
            {
              teamId: 'animalsandplants',
              name: 'AnimalsAndPlants'
            }
          ],
          userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8',
          hasBreakGlass: false
        }
      ])
    })

    describe('When query param is used', () => {
      test('With a name value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=tenant'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual([
          {
            name: 'Tenant User',
            email: 'tenant.user@defra.onmicrosoft.com',
            createdAt: '2023-09-28T13:55:42.049Z',
            updatedAt: '2024-07-15T09:56:32.809Z',
            scopes: [
              {
                scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'),
                scopeName: 'terminal'
              }
            ],
            teams: [
              {
                teamId: 'animalsandplants',
                name: 'AnimalsAndPlants'
              }
            ],
            userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8',
            hasBreakGlass: false
          }
        ])
      })

      test('With an email value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=admin.user@'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual([
          {
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
          }
        ])
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
