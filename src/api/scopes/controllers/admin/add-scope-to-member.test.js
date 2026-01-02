import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { createServer } from '../../../server.js'
import { scopes } from '@defra/cdp-validation-kit'
import { createUser } from '../../../users/helpers/create-user.js'
import { createTeam } from '../../../teams/helpers/create-team.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'

describe('#/scopes/admin/{scopeId}/member/add/{userId}/team/{teamId}', () => {
  let server
  let db

  async function callWithAuth(url, method = 'GET') {
    return await server.inject({
      method,
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [scopes.admin]
        }
      },
      payload: {
        startAt: new Date(2025, 1, 1, 12, 0),
        endAt: new Date(2025, 1, 1, 14, 0)
      }
    })
  }

  beforeAll(async () => {
    mockWellKnown()
    server = await createServer()
    await server.initialize()
    db = server.db
  })

  const team1 = { name: 'team1', description: 'team 1' }
  const user1 = { _id: 'user1', name: 'User 1', email: 'u1@email.com' }
  const scopeId = scopeDefinitions.breakGlass.scopeId

  beforeEach(async () => {
    await createTeam(db, team1)
    await createUser(db, user1)
  })

  afterEach(async () => {
    await db.collection(collections.team).drop()
    await db.collection(collections.user).drop()
    await db.collection(collections.relationship).drop()
  })

  it('should add a permission to a member', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/member/add/${user1._id}/team/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(200)

    const relationship = await db.collection(collections.relationship).findOne({
      subject: user1._id,
      relation: scopeId,
      resource: team1.name
    })

    expect(relationship).toMatchObject({
      subject: user1._id,
      subjectType: 'user',
      relation: scopeId,
      resource: team1.name,
      resourceType: 'team'
    })
  })

  it('should 404 when applied to a non-existing team', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/member/add/${user1._id}/team/wrongteam`,
      'PATCH'
    )

    expect(statusCode).toBe(404)
  })

  it('should 404 when applied to a non-existing user', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/member/add/wronguser/team/${team1.name}`,
      'PATCH'
    )
    expect(statusCode).toBe(404)
  })

  it('should 400 when applied to a invalid scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/invalid/member/add/${user1._id}/team/${team1.name}`,
      'PATCH'
    )
    expect(statusCode).toBe(400)
  })

  it('should 400 when applied to a non-team scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/admin/member/add/${user1._id}/team/wrongteam`,
      'PATCH'
    )
    expect(statusCode).toBe(400)
  })
})
