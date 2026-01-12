import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { createUser } from '../../../users/helpers/create-user.js'
import { createTeam } from '../../../teams/helpers/create-team.js'
import {
  grantPermissionToTeam,
  grantPermissionToUser,
  grantTeamScopedPermissionToUser
} from '../../../permissions/helpers/relationships/relationships.js'
import { collections } from '../../../../../test-helpers/constants.js'
import { scopesAdmin } from '../../routes.js'
import { createTestServer } from '../../../../../test-helpers/create-test-server.js'

describe("#'/scopes/admin/{scopeId}'", () => {
  let server
  let db

  const user1 = { _id: 'user1', name: 'User 1', email: 'u1@email.com' }
  const user2 = { _id: 'user2', name: 'User 2', email: 'u2@email.com' }
  const team1 = { name: 'team1', description: 'team 1' }
  const team2 = { name: 'team2', description: 'team 2' }
  const breakGlass = scopeDefinitions.breakGlass.scopeId
  const extTest = scopeDefinitions.externalTest.scopeId
  const restrictedTechPostgres = scopeDefinitions.restrictedTechPostgres.scopeId

  async function callWithAuth(url, method = 'GET') {
    return await server.inject({
      method,
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [scopes.admin]
        }
      }
    })
  }

  beforeAll(async () => {
    mockWellKnown()
    server = await createTestServer({ plugins: [scopesAdmin] })
    await server.initialize()
    db = server.db
  })

  beforeAll(async () => {
    await createUser(db, user1)
    await createUser(db, user2)
    await createTeam(db, team1)
    await createTeam(db, team2)

    await grantPermissionToUser(db, user1._id, extTest)
    await grantPermissionToUser(db, user2._id, extTest)
    await grantPermissionToTeam(db, team1.name, extTest)
    await grantPermissionToTeam(db, team2.name, extTest)

    await grantTeamScopedPermissionToUser(db, user1._id, team1.name, breakGlass)
    await grantTeamScopedPermissionToUser(db, user2._id, team2.name, breakGlass)
  })

  afterAll(async () => {
    db.collection(collections.relationship).drop()
    db.collection(collections.team).drop()
    db.collection(collections.user).drop()
  })

  it('should fail with a Bad Request status if the scopeId is invalid', async () => {
    const { statusCode, statusMessage } = await callWithAuth(
      '/scopes/admin/invalid'
    )
    expect(statusCode).toBe(400)
    expect(statusMessage).toBe('Bad Request')
  })

  it('should return the scope and empty lists if its not assigned to anything', async () => {
    const { result, statusCode } = await callWithAuth(
      `/scopes/admin/${restrictedTechPostgres}`
    )

    expect(statusCode).toBe(200)
    expect(result).toMatchObject({
      ...scopeDefinitions.restrictedTechPostgres,
      teams: [],
      users: [],
      members: []
    })
  })

  it('should return lists of the users, teams that have the externalTest scope', async () => {
    const { result, statusCode } = await callWithAuth(
      `/scopes/admin/${extTest}`
    )
    expect(statusCode).toBe(200)
    expect(result).toMatchObject({
      ...scopeDefinitions.externalTest,
      teams: [
        { teamId: team1.name, teamName: team1.name },
        { teamId: team2.name, teamName: team2.name }
      ],
      users: [
        { userId: user1._id, userName: user1.name },
        { userId: user2._id, userName: user2.name }
      ],
      members: []
    })
  })

  it('should return lists of the users with team-scoped (member) scopes', async () => {
    const { result, statusCode } = await callWithAuth(
      `/scopes/admin/${breakGlass}`
    )

    expect(statusCode).toBe(200)
    expect(result).toMatchObject({
      ...scopeDefinitions.breakGlass,
      teams: [],
      users: [],
      members: [
        {
          userId: user1._id,
          userName: user1.name,
          teamId: team1.name,
          teamName: team1.name
        },
        {
          userId: user2._id,
          userName: user2.name,
          teamId: team2.name,
          teamName: team2.name
        }
      ]
    })
  })

  it('should work the same as /scopes/admin/{scopeId}', async () => {
    // This is a hang-over from when scopeId was a ObjectId and didn't match the value.
    const { result, statusCode } = await callWithAuth(
      `/scopes/admin/name/${scopeDefinitions.restrictedTechPostgres.scopeId}`
    )

    expect(statusCode).toBe(200)
    expect(result).toMatchObject({
      ...scopeDefinitions.restrictedTechPostgres,
      teams: [],
      users: [],
      members: []
    })
  })
})
