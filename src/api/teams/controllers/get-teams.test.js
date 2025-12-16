import { createServer } from '../../server.js'
import { collections } from '../../../../test-helpers/constants.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import {
  deleteMany,
  replaceMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'

describe('GET:/teams', () => {
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

  async function getTeamsEndpoint(url = '/teams') {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When teams are in the DB', () => {
    beforeEach(async () => {
      await replaceManyTestHelper(collections.team, [
        platformTeamFixture,
        tenantTeamFixture
      ])
    })

    afterEach(async () => {
      await deleteManyTestHelper([collections.team])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getTeamsEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual([
        {
          name: 'AnimalsAndPlants',
          description: 'A team for the animals and plants',
          github: 'cdp-animals-and-plants',
          serviceCodes: ['AAP'],
          alertEmailAddresses: [],
          createdAt: '2024-12-03T12:26:10.858Z',
          updatedAt: '2024-12-04T08:17:06.796Z',
          scopes: [
            {
              scopeId: 'postgres',
              scopeName: 'postgres'
            }
          ],
          teamId: 'animalsandplants',
          users: []
        },
        {
          name: 'Platform',
          description: 'The team that runs the platform',
          github: 'cdp-platform',
          serviceCodes: ['CDP'],
          alertEmailAddresses: ['mary@mary.com'],
          alertEnvironments: ['infra-dev', 'management'],
          createdAt: '2023-09-28T13:52:01.906Z',
          updatedAt: '2024-12-04T08:17:06.795Z',
          scopes: [
            {
              scopeId: 'externalTest',
              scopeName: 'externalTest'
            },
            {
              scopeId: 'admin',
              scopeName: 'admin'
            }
          ],
          teamId: 'platform',
          users: []
        }
      ])
    })

    describe('With "query" param', () => {
      test('Should provide expected response with a name value', async () => {
        const { result, statusCode, statusMessage } = await getTeamsEndpoint(
          '/teams?query=animals'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual([
          {
            name: 'AnimalsAndPlants',
            description: 'A team for the animals and plants',
            github: 'cdp-animals-and-plants',
            serviceCodes: ['AAP'],
            alertEmailAddresses: [],
            createdAt: '2024-12-03T12:26:10.858Z',
            updatedAt: '2024-12-04T08:17:06.796Z',
            scopes: [
              {
                scopeId: 'postgres',
                scopeName: 'postgres'
              }
            ],
            teamId: 'animalsandplants',
            users: []
          }
        ])
      })
    })

    describe('With "hasGithub" param', () => {
      test('Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getTeamsEndpoint(
          '/teams?hasGithub=true'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual([
          {
            name: 'AnimalsAndPlants',
            description: 'A team for the animals and plants',
            github: 'cdp-animals-and-plants',
            serviceCodes: ['AAP'],
            alertEmailAddresses: [],
            createdAt: '2024-12-03T12:26:10.858Z',
            updatedAt: '2024-12-04T08:17:06.796Z',
            scopes: [
              {
                scopeId: 'postgres',
                scopeName: 'postgres'
              }
            ],
            teamId: 'animalsandplants',
            users: []
          },
          {
            name: 'Platform',
            description: 'The team that runs the platform',
            github: 'cdp-platform',
            serviceCodes: ['CDP'],
            alertEmailAddresses: ['mary@mary.com'],
            alertEnvironments: ['infra-dev', 'management'],
            createdAt: '2023-09-28T13:52:01.906Z',
            updatedAt: '2024-12-04T08:17:06.795Z',
            scopes: [
              {
                scopeId: 'externalTest',
                scopeName: 'externalTest'
              },
              {
                scopeId: 'admin',
                scopeName: 'admin'
              }
            ],
            teamId: 'platform',
            users: []
          }
        ])
      })
    })

    describe('With "name" param', () => {
      test('Should provide expected matching response', async () => {
        const { result, statusCode, statusMessage } = await getTeamsEndpoint(
          '/teams?name=Platform'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual([
          {
            name: 'Platform',
            description: 'The team that runs the platform',
            github: 'cdp-platform',
            serviceCodes: ['CDP'],
            alertEmailAddresses: ['mary@mary.com'],
            alertEnvironments: ['infra-dev', 'management'],
            createdAt: '2023-09-28T13:52:01.906Z',
            updatedAt: '2024-12-04T08:17:06.795Z',
            scopes: [
              {
                scopeId: 'externalTest',
                scopeName: 'externalTest'
              },
              {
                scopeId: 'admin',
                scopeName: 'admin'
              }
            ],
            teamId: 'platform',
            users: []
          }
        ])
      })
    })
  })

  describe('When NO teams are in the DB', () => {
    beforeEach(async () => {
      await deleteManyTestHelper([collections.team])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getTeamsEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual([])
    })
  })
})
