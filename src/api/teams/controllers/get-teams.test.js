import { createServer } from '../../server.js'
import {
  deleteMany,
  replaceMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'

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

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  async function getTeamsEndpoint(url = '/teams') {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When teams are in the DB', () => {
    beforeEach(async () => {
      await replaceManyTestHelper('teams', [
        platformTeamFixture,
        tenantTeamFixture
      ])
    })

    afterEach(async () => {
      await deleteManyTestHelper('teams')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getTeamsEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        teams: [
          expect.objectContaining({
            alertEmailAddresses: [],
            description: 'A team for the animals and plants',
            github: 'cdp-animals-and-plants',
            name: 'AnimalsAndPlants',
            scopes: [],
            serviceCodes: ['AAP'],
            teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
            users: []
          }),
          expect.objectContaining({
            alertEmailAddresses: ['mary@mary.com'],
            description: 'The team that runs the platform',
            github: 'cdp-platform',
            name: 'Platform',
            scopes: [],
            serviceCodes: ['CDP'],
            teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
            users: []
          })
        ]
      })
    })

    describe('With "query" param', () => {
      test('Should provide expected response with a name value', async () => {
        const { result, statusCode, statusMessage } = await getTeamsEndpoint(
          '/teams?query=animals'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          teams: [
            expect.objectContaining({
              alertEmailAddresses: [],
              description: 'A team for the animals and plants',
              github: 'cdp-animals-and-plants',
              name: 'AnimalsAndPlants',
              scopes: [],
              serviceCodes: ['AAP'],
              teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
              users: []
            })
          ]
        })
      })
    })

    describe('With "hasGithub" param', () => {
      test('Should provide expected response', async () => {
        const { result, statusCode, statusMessage } = await getTeamsEndpoint(
          '/teams?hasGithub=true'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          teams: [
            expect.objectContaining({
              alertEmailAddresses: [],
              description: 'A team for the animals and plants',
              github: 'cdp-animals-and-plants',
              name: 'AnimalsAndPlants',
              scopes: [],
              serviceCodes: ['AAP'],
              teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
              users: []
            }),
            expect.objectContaining({
              alertEmailAddresses: ['mary@mary.com'],
              description: 'The team that runs the platform',
              github: 'cdp-platform',
              name: 'Platform',
              scopes: [],
              serviceCodes: ['CDP'],
              teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
              users: []
            })
          ]
        })
      })
    })

    describe('With "name" param', () => {
      test('Should provide expected matching response', async () => {
        const { result, statusCode, statusMessage } = await getTeamsEndpoint(
          '/teams?name=Platform'
        )

        expect(statusCode).toBe(200)
        expect(statusMessage).toBe('OK')

        expect(result).toEqual({
          message: 'success',
          teams: [
            expect.objectContaining({
              alertEmailAddresses: ['mary@mary.com'],
              description: 'The team that runs the platform',
              github: 'cdp-platform',
              name: 'Platform',
              scopes: [],
              serviceCodes: ['CDP'],
              teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
              users: []
            })
          ]
        })
      })
    })
  })

  describe('When NO teams are in the DB', () => {
    beforeEach(async () => {
      await deleteManyTestHelper('teams')
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getTeamsEndpoint()

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')

      expect(result).toEqual({
        message: 'success',
        teams: []
      })
    })
  })
})
