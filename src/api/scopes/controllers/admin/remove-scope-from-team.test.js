import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { scopes } from '@defra/cdp-validation-kit'
import { createTeam } from '../../../teams/helpers/create-team.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'
import { grantPermissionToTeam } from '../../../permissions/helpers/relationships/relationships.js'
import { createTestServer } from '../../../../../test-helpers/create-test-server.js'
import { scopesAdmin } from '../../routes.js'

describe('#/scopes/admin/{scopeId}/team/remove/{teamId}', () => {
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

  it('should remove a permission from a team', async () => {
    const scopeId = scopeDefinitions.restrictedTechPostgres.scopeId
    const remainingScopeId = scopeDefinitions.externalTest.scopeId

    await grantPermissionToTeam(db, team1.name, scopeId)
    await grantPermissionToTeam(db, team1.name, remainingScopeId)

    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/team/remove/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(200)

    const removedRelationship = await db
      .collection(collections.relationship)
      .findOne({
        subject: team1.name,
        relation: 'granted',
        resource: scopeId
      })

    expect(removedRelationship).toBeNull()

    const remainingRelationship = await db
      .collection(collections.relationship)
      .findOne({
        subject: team1.name,
        relation: 'granted',
        resource: remainingScopeId
      })

    expect(remainingRelationship).toMatchObject({
      subject: team1.name,
      subjectType: 'team',
      relation: 'granted',
      resource: remainingScopeId,
      resourceType: 'permission'
    })
  })

  it('should 400 when applied to a invalid scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/invalid/team/remove/${team1.name}`,
      'PATCH'
    )

    expect(statusCode).toBe(400)
  })
})
