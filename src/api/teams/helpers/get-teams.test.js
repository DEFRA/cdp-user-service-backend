import { collections } from '../../../../test-helpers/constants.js'
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { withTestDb } from '../../../../test-helpers/with-test-db.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import { getTeams } from './get-teams.js'
import { getTeamsController } from '../controllers/get-teams.js'

const animalsTeamResult = {
  name: 'AnimalsAndPlants',
  description: 'A team for the animals and plants',
  github: 'cdp-animals-and-plants',
  serviceCodes: ['AAP'],
  alertEmailAddresses: [],
  createdAt: '2024-12-03T12:26:10.858Z',
  updatedAt: '2024-12-04T08:17:06.796Z',
  scopes: [],
  teamId: 'animalsandplants',
  users: []
}

const platformTeamResult = {
  name: 'Platform',
  description: 'The team that runs the platform',
  github: 'cdp-platform',
  serviceCodes: ['CDP'],
  alertEmailAddresses: ['mary@mary.com'],
  alertEnvironments: ['infra-dev', 'management'],
  slackChannels: {
    prod: 'cdp-platform-alerts',
    nonProd: 'cdp-platform-non-prod-alerts',
    team: 'cdp-platform-team'
  },
  createdAt: '2023-09-28T13:52:01.906Z',
  updatedAt: '2024-12-04T08:17:06.795Z',
  scopes: [],
  teamId: 'platform',
  users: []
}

describe('getTeams', () => {
  let db
  let replaceMany
  let deleteMany

  beforeAll(async () => {
    ;({ db, replaceMany, deleteMany } = await withTestDb())
  })

  async function seedTestData() {
    await replaceMany(collections.team, [
      platformTeamFixture,
      tenantTeamFixture
    ])
  }

  async function cleanupTestData() {
    await deleteMany([collections.team])
  }

  describe('helper function', () => {
    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return all teams sorted by name', async () => {
      const result = await getTeams(db)

      expect(result).toEqual([animalsTeamResult, platformTeamResult])
    })

    test('Should filter by query (name search)', async () => {
      const result = await getTeams(db, { query: 'animals' })

      expect(result).toEqual([animalsTeamResult])
    })

    test('Should filter by exact name', async () => {
      const result = await getTeams(db, { name: 'Platform' })

      expect(result).toEqual([platformTeamResult])
    })

    test('Should filter by hasGithub', async () => {
      const result = await getTeams(db, { hasGithub: true })

      expect(result).toEqual([animalsTeamResult, platformTeamResult])
    })

    test('Should return empty array when no teams exist', async () => {
      await deleteMany([collections.team])

      const result = await getTeams(db)

      expect(result).toEqual([])
    })
  })

  describe('GET /teams endpoint', () => {
    let server

    beforeAll(async () => {
      server = await createTestServer({
        routes: { method: 'GET', path: '/teams', ...getTeamsController }
      })
    })

    beforeEach(seedTestData)
    afterEach(cleanupTestData)

    test('Should return 200 with all teams', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/teams'
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual([animalsTeamResult, platformTeamResult])
    })

    test('Should filter with query param', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/teams?query=animals'
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual([animalsTeamResult])
    })

    test('Should filter with name param', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/teams?name=Platform'
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual([platformTeamResult])
    })

    test('Should filter with hasGithub param', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/teams?hasGithub=true'
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual([animalsTeamResult, platformTeamResult])
    })
  })
})
