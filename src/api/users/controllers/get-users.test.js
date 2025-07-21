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
    })

    afterEach(async () => {
      await deleteManyTestHelper('users')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUsersEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        users: [
          expect.objectContaining({
            email: 'akira@defra.onmicrosoft.com',
            name: 'Akira',
            scopes: [],
            teams: [],
            userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8'
          }),
          expect.objectContaining({
            email: 'tetsuo.shima@defra.onmicrosoft.com',
            github: 'TetsuoShima',
            name: 'TetsuoShima',
            scopes: [],
            teams: [],
            userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
          })
        ]
      })
    })

    describe('When query param is used', () => {
      test('With a name value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } =
          await getUsersEndpoint('/users?query=akira')

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          users: [
            expect.objectContaining({
              email: 'akira@defra.onmicrosoft.com',
              name: 'Akira',
              scopes: [],
              teams: [],
              userId: 'b7606810-f0c6-4db7-b067-ba730ef706e8'
            })
          ]
        })
      })

      test('With an email value, Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getUsersEndpoint(
          '/users?query=tetsuo.shima@'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          users: [
            expect.objectContaining({
              email: 'tetsuo.shima@defra.onmicrosoft.com',
              github: 'TetsuoShima',
              name: 'TetsuoShima',
              scopes: [],
              teams: [],
              userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
            })
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
