import { createServer } from '../../server.js'
import {
  deleteMany,
  replaceMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import {
  adminScopeFixture,
  prodAccessScopeFixture,
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  testAsTenantScopeFixture
} from '../../../__fixtures__/scopes.js'
import { ObjectId } from 'mongodb'
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

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  async function getUsersEndpoint(url = '/users') {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When users are in the DB', () => {
    beforeEach(async () => {
      await replaceManyTestHelper('users', [
        userAdminFixture,
        userTenantFixture
      ])
      await replaceManyTestHelper('teams', [
        platformTeamFixture,
        tenantTeamFixture
      ])
      await replaceManyTestHelper('scopes', [
        externalTestScopeFixture,
        postgresScopeFixture,
        terminalScopeFixture,
        prodAccessScopeFixture,
        adminScopeFixture,
        testAsTenantScopeFixture
      ])
    })

    afterEach(async () => {
      await deleteManyTestHelper('users')
      await deleteManyTestHelper('scopes')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUsersEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        users: [
          {
            name: 'Admin User',
            email: 'admin.user@defra.onmicrosoft.com',
            createdAt: '2023-09-28T13:53:44.948Z',
            updatedAt: '2024-12-03T12:26:28.965Z',
            github: 'AdminUser',
            scopes: [
              {
                scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
                scopeName: 'prodAccess'
              },
              {
                scopeId: new ObjectId('7751e606a171ebffac3cc9dd'),
                scopeName: 'admin'
              }
            ],
            teams: [
              {
                teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
                name: 'Platform'
              }
            ],
            userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
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
                teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
                name: 'AnimalsAndPlants'
              }
            ],
            userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8'
          }
        ]
      })
    })

    describe('When query param is used', () => {
      test('With a name value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=tenant'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          users: [
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
                  teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
                  name: 'AnimalsAndPlants'
                }
              ],
              userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8'
            }
          ]
        })
      })

      test('With an email value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=admin.user@'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          users: [
            {
              name: 'Admin User',
              email: 'admin.user@defra.onmicrosoft.com',
              createdAt: '2023-09-28T13:53:44.948Z',
              updatedAt: '2024-12-03T12:26:28.965Z',
              github: 'AdminUser',
              scopes: [
                {
                  scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
                  scopeName: 'prodAccess'
                },
                {
                  scopeId: new ObjectId('7751e606a171ebffac3cc9dd'),
                  scopeName: 'admin'
                }
              ],
              teams: [
                {
                  teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
                  name: 'Platform'
                }
              ],
              userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
            }
          ]
        })
      })
    })
  })

  describe('When NO users are in the DB', () => {
    beforeEach(async () => {
      await deleteManyTestHelper('users')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUsersEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        users: []
      })
    })
  })
})
