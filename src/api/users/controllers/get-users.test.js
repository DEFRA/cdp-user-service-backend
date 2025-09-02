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
  adminFixture,
  breakGlassFixture,
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  testAsTenantFixture
} from '../../../__fixtures__/scopes.js'
import { ObjectId } from 'mongodb'

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
      await replaceManyTestHelper('scopes', [
        externalTestScopeFixture,
        postgresScopeFixture,
        terminalScopeFixture,
        breakGlassFixture,
        adminFixture,
        testAsTenantFixture
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

      expect(result).toEqual([
        expect.objectContaining({
          email: 'akira@defra.onmicrosoft.com',
          name: 'Akira',
          scopes: [
            {
              scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'),
              scopeName: 'terminal'
            }
          ],
          teams: [],
          userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8'
        }),
        expect.objectContaining({
          email: 'tetsuo.shima@defra.onmicrosoft.com',
          github: 'TetsuoShima',
          name: 'TetsuoShima',
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
          teams: [],
          userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
        })
      ])
    })

    describe('When query param is used', () => {
      test('With a name value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } =
          await getUsersEndpoint('/users?query=akira')

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual(
          expect.objectContaining([
            expect.objectContaining({
              email: 'akira@defra.onmicrosoft.com',
              name: 'Akira',
              scopes: [
                {
                  scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'),
                  scopeName: 'terminal'
                }
              ],
              teams: [],
              userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8'
            })
          ])
        )
      })

      test('With an email value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=tetsuo.shima@'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual([
          expect.objectContaining({
            email: 'tetsuo.shima@defra.onmicrosoft.com',
            github: 'TetsuoShima',
            name: 'TetsuoShima',
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
            teams: [],
            userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
          })
        ])
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

      expect(result).toEqual([])
    })
  })
})
