import fetchMock from 'jest-fetch-mock'

import { config } from '~/src/config/index.js'
import { createServer } from '~/src/api/server.js'
import { wellKnownResponseFixture } from '~/src/__fixtures__/well-known.js'
import { userOneFixture } from '~/src/__fixtures__/users.js'
import { deleteMany, replaceOne } from '~/test-helpers/mongo-helpers.js'

const oidcWellKnownConfigurationUrl = config.get(
  'oidcWellKnownConfigurationUrl'
)

describe('GET:/users/{userId}', () => {
  let server
  let replaceOneTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    fetchMock.enableMocks()

    fetchMock.mockIf(oidcWellKnownConfigurationUrl, () =>
      Promise.resolve(JSON.stringify(wellKnownResponseFixture))
    )

    server = await createServer()
    await server.initialize()

    replaceOneTestHelper = replaceOne(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  afterAll(async () => {
    fetchMock.disableMocks()
    await server.mongoClient?.close()
    await server.stop({ timeout: 0 })
  })

  async function getUserEndpoint(url) {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When a user is in the DB', () => {
    beforeEach(async () => {
      await replaceOneTestHelper('users', userOneFixture)
    })

    afterEach(async () => {
      await deleteManyTestHelper('users')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getUserEndpoint(
        `/users/${userOneFixture._id}`
      )

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        user: expect.objectContaining({
          email: 'tetsuo.shima@defra.onmicrosoft.com',
          github: 'TetsuoShima',
          name: 'TetsuoShima',
          scopes: [],
          teams: [],
          userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677'
        })
      })
    })
  })

  describe('When non uuid passed as userId param', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } =
        await getUserEndpoint('/users/not-a-uuid')

      expect(statusCode).toBe(400)
      expect(statusMessage).toBe('Bad Request')

      expect(result).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: '"userId" must be a valid GUID',
        validation: {
          source: 'params',
          keys: ['userId']
        }
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
