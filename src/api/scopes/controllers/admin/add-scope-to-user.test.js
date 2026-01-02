import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { createServer } from '../../../server.js'
import { scopes } from '@defra/cdp-validation-kit'
import { createUser } from '../../../users/helpers/create-user.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'

describe('#/scopes/admin/{scopeId}/user/add/{teamId}', () => {
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

  const user1 = { _id: 'user1', name: 'User 1', email: 'u1@email.com' }

  beforeEach(async () => {
    await createUser(db, user1)
  })

  afterEach(async () => {
    await db.collection(collections.user).drop()
    await db.collection(collections.relationship).drop()
  })

  it('should add a permission to a user', async () => {
    const scopeId = scopeDefinitions.restrictedTechPostgres.scopeId
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/user/add/${user1._id}`,
      'PATCH'
    )

    expect(statusCode).toBe(200)

    const relationship = await db.collection(collections.relationship).findOne({
      subject: user1._id,
      relation: 'granted',
      resource: scopeId
    })

    expect(relationship).toMatchObject({
      subject: user1._id,
      subjectType: 'user',
      relation: 'granted',
      resource: scopeId,
      resourceType: 'permission'
    })
  })

  it('should 404 when applied to a non-existing user', async () => {
    const scopeId = scopeDefinitions.restrictedTechPostgres.scopeId
    const { statusCode } = await callWithAuth(
      `/scopes/admin/${scopeId}/user/add/doesntexist`,
      'PATCH'
    )

    expect(statusCode).toBe(404)
  })

  it('should 400 when applied to a invalid scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/invalid/user/add/${user1._id}`,
      'PATCH'
    )
    expect(statusCode).toBe(400)
  })

  it('should 400 when applied to a non-team scope', async () => {
    const { statusCode } = await callWithAuth(
      `/scopes/admin/admin/user/add/${user1._id}`,
      'PATCH'
    )
    expect(statusCode).toBe(400)
  })
})
