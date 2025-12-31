import { createServer } from '../../server.js'
import { collections } from '../../../../test-helpers/constants.js'
import { platformTeamFixture } from '../../../__fixtures__/teams.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import { deleteMany } from '../../../../test-helpers/mongo-helpers.js'
import { createTeam } from '../helpers/create-team.js'
import {
  addUserToTeam,
  grantPermissionToTeam
} from '../../permissions/helpers/relationships/relationships.js'
import { scopeDefinitions } from '../../../config/scopes.js'
import { createUser } from '../../users/helpers/create-user.js'

describe('GET:/teams/{teamId}', () => {
  let server
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()

    server = await createServer()
    await server.initialize()
    deleteManyTestHelper = deleteMany(server.db)
  })

  async function getTeamEndpoint(url) {
    return await server.inject({
      method: 'GET',
      url
    })
  }

  describe('When a team is in the DB', () => {
    beforeEach(async () => {
      await createTeam(server.db, {
        name: 'Platform',
        description: 'The team that runs the platform',
        github: 'cdp-platform',
        serviceCodes: ['CDP'],
        alertEmailAddresses: ['mary@mary.com'],
        alertEnvironments: ['infra-dev', 'management']
      })

      await createUser(server.db, {
        _id: 'user1',
        name: 'User 1',
        email: 'user1@email.com',
        github: 'user1'
      })

      await createUser(server.db, {
        _id: 'user2',
        name: 'User 2',
        email: 'user2@email.com',
        github: 'user2'
      })

      await addUserToTeam(server.db, 'user1', 'platform')
      await addUserToTeam(server.db, 'user2', 'platform')

      await grantPermissionToTeam(
        server.db,
        'platform',
        scopeDefinitions.admin.scopeId
      )

      await grantPermissionToTeam(
        server.db,
        'platform',
        scopeDefinitions.externalTest.scopeId
      )
    })

    afterEach(async () => {
      await deleteManyTestHelper([collections.team])
    })

    test('Should provide expected response', async () => {
      const { result, statusCode, statusMessage } = await getTeamEndpoint(
        `/teams/${platformTeamFixture._id}`
      )

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
      expect(result).toMatchObject({
        name: 'Platform',
        description: 'The team that runs the platform',
        github: 'cdp-platform',
        serviceCodes: ['CDP'],
        alertEmailAddresses: ['mary@mary.com'],
        alertEnvironments: ['infra-dev', 'management'],
        scopes: [
          {
            scopeId: 'admin',
            scopeName: 'admin'
          },
          {
            scopeId: 'externalTest',
            scopeName: 'externalTest'
          }
        ],
        teamId: 'platform',
        users: [
          {
            name: 'User 1',
            userId: 'user1'
          },
          {
            name: 'User 2',
            userId: 'user2'
          }
        ]
      })
    })
  })

  describe('When team id does not exist in the db', () => {
    test('Should provide expected error response', async () => {
      const { result, statusCode, statusMessage } = await getTeamEndpoint(
        '/team/non-existent-team'
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
