import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { createServer } from '../../../server.js'
import { scopes } from '@defra/cdp-validation-kit'
import { createUser } from '../../../users/helpers/create-user.js'
import { createTeam } from '../../../teams/helpers/create-team.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'
import { grantTeamScopedPermissionToUser } from '../../../permissions/helpers/relationships/relationships.js'

describe('#/scopes/admin/{scopeId}/member/remove/{userId}/team/{teamId}', () => {
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

  it('should remove a permission from a member', async () => {
    await grantTeamScopedPermissionToUser(db, user1._id, team1.name, scopeId)

    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/member/remove/${user1._id}/team/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(200)

    const relationship = await db.collection(collections.relationship).findOne({
      subject: user1._id,
      relation: scopeId,
      resource: team1.name
    })

    expect(relationship).toBeNull()
  })

  it('should 400 when applied to a invalid scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/invalid/member/remove/${user1._id}/team/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(400)
  })

  it('should 400 when applied to a non-member scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/admin/member/remove/${user1._id}/team/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(400)
  })
})
