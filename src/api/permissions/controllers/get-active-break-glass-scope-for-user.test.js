import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { collections } from '../../../../test-helpers/constants.js'
import { withTestDb } from '../../../../test-helpers/with-test-db.js'
import {
  platformTeamFixture,
  teamWithoutUsers,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'

import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import { getActiveBreakGlassScopeForUser } from './get-active-break-glass-scope-for-user.js'
import { grantTeamScopedPermissionToUser } from '../helpers/relationships/relationships.js'
import { scopeDefinitions } from '../../../config/scopes.js'
import { addHours, subHours } from 'date-fns'

describe('GET /scopes endpoint', () => {
  let server
  let db
  let replaceMany
  let deleteMany

  beforeAll(async () => {
    const testDb = await withTestDb()
    db = testDb.db
    replaceMany = testDb.replaceMany
    deleteMany = testDb.deleteMany

    server = await createTestServer({
      routes: {
        method: 'GET',
        path: '/scopes/active-break-glass',
        ...getActiveBreakGlassScopeForUser
      }
    })
  })

  function scopesEndpoint(credentials) {
    return server.inject({
      method: 'GET',
      url: '/scopes/active-break-glass',
      auth: {
        strategy: 'azure-oidc',
        credentials
      }
    })
  }

  beforeEach(async () => {
    await replaceMany(collections.user, [userAdminFixture, userTenantFixture])
    await replaceMany(collections.team, [
      platformTeamFixture,
      tenantTeamFixture,
      teamWithoutUsers
    ])
  })

  afterEach(async () => {
    await deleteMany([collections.user, collections.team, collections.scope])
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('should return null when no break glass is issued', async () => {
    const { result } = await scopesEndpoint({
      id: userTenantFixture._id
    })

    expect(result).toEqual(null)
  })

  test('should an active breakglass', async () => {
    const start = subHours(new Date(), 1)
    const end = addHours(new Date(), 1)
    await grantTeamScopedPermissionToUser(
      db,
      userTenantFixture._id,
      tenantTeamFixture._id,
      scopeDefinitions.breakGlass.scopeId,
      start,
      end
    )
    const { result } = await scopesEndpoint({
      id: userTenantFixture._id
    })

    expect(result).toMatchObject({
      activeBreakGlass: {
        scopeId: 'breakGlass',
        scopeName: 'breakGlass',
        teamId: tenantTeamFixture._id,
        teamName: tenantTeamFixture._id,
        startAt: start,
        endAt: end
      }
    })
  })
})
