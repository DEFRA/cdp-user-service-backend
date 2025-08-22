import { createServer } from '../../server.js'
import { platformTeamFixture } from '../../../__fixtures__/teams.js'
import {
  deleteMany,
  replaceOne
} from '../../../../test-helpers/mongo-helpers.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'

describe('GET:/teams/{teamId}', () => {
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

  afterAll(async () => {
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
          alertEnvironments: ['infra-dev', 'management'],
          description: 'The team that runs the platform',
          github: 'cdp-platform',
          name: 'Platform',
          scopes: [],
          serviceCodes: ['CDP'],
          teamId: platformTeamFixture._id,
          users: []
        })
      })
    })
  })

  describe('When team ID does not exist in the db', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } = await getTeamEndpoint(
        '/team/this-team-does-not-exist'
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
