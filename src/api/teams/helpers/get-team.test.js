import { collections } from '../../../../test-helpers/constants.js'
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { withTestDb } from '../../../../test-helpers/with-test-db.js'
import { platformTeamFixture } from '../../../__fixtures__/teams.js'
import { getTeam } from './get-team.js'
import { getTeamController } from '../controllers/get-team.js'

const platformTeamResult = {
  name: 'Platform',
  description: 'The team that runs the platform',
  github: 'cdp-platform',
  serviceCodes: ['CDP'],
  alertEmailAddresses: ['mary@mary.com'],
  alertEnvironments: ['infra-dev', 'management'],
  createdAt: '2023-09-28T13:52:01.906Z',
  updatedAt: '2024-12-04T08:17:06.795Z',
  scopes: [],
  teamId: 'platform',
  users: []
}

describe('getTeam', () => {
  let db
  let replaceOne
  let deleteMany

  beforeAll(async () => {
    ;({ db, replaceOne, deleteMany } = await withTestDb())
  })

  async function seedTestData() {
    await replaceOne(collections.team, platformTeamFixture)
  }

  async function cleanupTestData() {
    await deleteMany([collections.team])
  }

  describe('helper function', () => {
    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return team with aggregated data', async () => {
      const result = await getTeam(db, platformTeamFixture._id)

      expect(result).toEqual(platformTeamResult)
    })

    test('Should return null when team does not exist', async () => {
      const result = await getTeam(db, 'non-existent-team-id')

      expect(result).toBeNull()
    })
  })

  describe('GET /teams/{teamId} endpoint', () => {
    let server

    beforeAll(async () => {
      server = await createTestServer({
        routes: { method: 'GET', path: '/teams/{teamId}', ...getTeamController }
      })
    })

    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return 200 with team data', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: `/teams/${platformTeamFixture._id}`
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(platformTeamResult)
    })

    test('Should return 404 when team does not exist', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/teams/non-existent-team'
      })

      expect(statusCode).toBe(404)
      expect(result).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Team not found'
      })
    })
  })
})
