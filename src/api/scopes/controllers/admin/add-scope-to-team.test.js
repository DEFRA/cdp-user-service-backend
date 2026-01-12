import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { scopes } from '@defra/cdp-validation-kit'
import { createTeam } from '../../../teams/helpers/create-team.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'
import { createTestServer } from '../../../../../test-helpers/create-test-server.js'
import { scopesAdmin } from '../../routes.js'

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
      }
    })
  }

  beforeAll(async () => {
    mockWellKnown()
    server = await createTestServer({ plugins: [scopesAdmin] })
    await server.initialize()
    db = server.db
  })

  const team1 = { name: 'team1', description: 'team 1' }

  beforeEach(async () => {
    await createTeam(db, team1)
  })

  afterEach(async () => {
    await db.collection(collections.team).drop()
    await db.collection(collections.relationship).drop()
  })

  it('should add a permission to a team', async () => {
    const scopeId = scopeDefinitions.restrictedTechPostgres.scopeId
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/team/add/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(200)

    const relationship = await db.collection(collections.relationship).findOne({
      subject: team1.name,
      relation: 'granted',
      resource: scopeId
    })

    expect(relationship).toMatchObject({
      subject: team1.name,
      subjectType: 'team',
      relation: 'granted',
      resource: scopeId,
      resourceType: 'permission'
    })
  })

  it('should 404 when applied to a non-existing team', async () => {
    const scopeId = scopeDefinitions.restrictedTechPostgres.scopeId
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/team/add/doesntexist`,
      'PATCH'
    )

    expect(statusCode).toBe(404)
  })

  it('should 400 when applied to a invalid scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/invalid/team/add/team1`,
      'PATCH'
    )
    expect(statusCode).toBe(400)
  })

  it('should 400 when applied to a non-team scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/canGrantBreakGlass/team/add/team1`,
      'PATCH'
    )
    expect(statusCode).toBe(400)
  })
})
