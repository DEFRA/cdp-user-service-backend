import fetchMock from 'jest-fetch-mock'

import { config } from '~/src/config/config.js'
import { createServer } from '~/src/api/server.js'
import { wellKnownResponseFixture } from '~/src/__fixtures__/well-known.js'
import { platformTeamFixture } from '~/src/__fixtures__/teams.js'
import { deleteMany, replaceOne } from '~/test-helpers/mongo-helpers.js'

const oidcWellKnownConfigurationUrl = config.get(
  'oidcWellKnownConfigurationUrl'
)

describe('GET:/teams/{teamId}', () => {
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
    await server.stop({ timeout: 0 })
  })

  async function getTeamEndpoint(url) {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When a team is in the DB', () => {
    beforeEach(async () => {
      await replaceOneTestHelper('teams', platformTeamFixture)
    })

    afterEach(async () => {
      await deleteManyTestHelper('teams')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getTeamEndpoint(
        `/teams/${platformTeamFixture._id}`
      )

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        team: expect.objectContaining({
          alertEmailAddresses: ['mary@mary.com'],
          description: 'The team that runs the platform',
          github: 'cdp-platform',
          name: 'Platform',
          scopes: [],
          serviceCodes: ['CDP'],
          teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
          users: []
        })
      })
    })
  })

  describe('When non UUID passed as teamId param', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } =
        await getTeamEndpoint('/teams/not-a-uuid')

      expect(statusCode).toBe(400)
      expect(statusMessage).toBe('Bad Request')

      expect(result).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: '"teamId" must be a valid GUID'
      })
    })
  })

  describe('When team UUID does not exist in the db', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } = await getTeamEndpoint(
        '/team/b4c0d7f5-afc7-4dd2-aac5-5467f72a5cfe'
      )

      expect(statusCode).toBe(404)
      expect(statusMessage).toBe('Not Found')

      expect(result).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Not Found'
      })
    })
  })
})
