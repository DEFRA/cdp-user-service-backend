import { subHours, addHours } from 'date-fns'
import {
  addUserToTeam,
  createIndexes,
  grantPermissionToTeam,
  grantPermissionToUser,
  grantTeamScopedPermissionToUser,
  removeUserFromTeam,
  revokePermissionFromTeam,
  revokePermissionFromUser,
  revokeTeamScopedPermissionFromUser
} from './relationships.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { scopesForUser } from './legacy-scopes-for-user.js'
import { scopes } from '@defra/cdp-validation-kit'

describe('#legacyScopesForUser', () => {
  const request = {}

  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
  })

  beforeEach(async () => {
    await request.db.collection('relationships').drop()
    await createIndexes(request.db)
  })

  test('user level permissions are provided as scopes', async () => {
    const userid = 'user1'
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.externalTest.scopeId
    )
    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [scopes.externalTest, `user:${userid}`],
      scopeFlags: { isAdmin: false, isTenant: false, hasBreakGlass: false }
    })
  })

  test('user inherits permissions from teams they belong to', async () => {
    const userid = 'user2'
    const teamId = 'platform'
    await grantPermissionToTeam(
      request.db,
      teamId,
      scopeDefinitions.externalTest.scopeId
    )
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.restrictedTechPython.scopeId
    )
    await addUserToTeam(request.db, userid, teamId)

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        scopes.externalTest,
        scopes.restrictedTechPython,
        `${scopes.serviceOwner}:team:${teamId}`,
        scopes.tenant,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
    })
  })

  test('admin scope flag is set if user has admin permission', async () => {
    const userid = 'user-admin-1'
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.admin.scopeId
    )
    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [scopes.admin, `user:${userid}`],
      scopeFlags: { isAdmin: true, isTenant: false, hasBreakGlass: false }
    })
  })

  test('tenant scope flag is set if user is a member of a team and not an admin', async () => {
    const userid = 'user-admin-2'
    const teamId = 'platform'
    await grantPermissionToTeam(
      request.db,
      teamId,
      scopeDefinitions.admin.scopeId
    )
    await addUserToTeam(request.db, userid, teamId)

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        scopes.admin,
        `${scopes.serviceOwner}:team:${teamId}`,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: true, isTenant: false, hasBreakGlass: false }
    })
  })

  test('tenant scope flag is set if user is a member of a team and not an admin', async () => {
    const userid = 'user-3'
    const teamId = 'foo-team'
    await addUserToTeam(request.db, userid, teamId)

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        `${scopes.serviceOwner}:team:${teamId}`,
        scopes.tenant,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
    })
  })

  test('expired breakglass relations are not shown', async () => {
    const userid = 'user-3'
    const teamId = 'foo-team'
    await addUserToTeam(request.db, userid, teamId)

    const now = new Date()
    await grantTeamScopedPermissionToUser(
      request.db,
      userid,
      teamId,
      scopeDefinitions.breakGlass.scopeId,
      subHours(now, 4),
      subHours(now, 2)
    )

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        `${scopes.serviceOwner}:team:${teamId}`,
        scopes.tenant,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
    })
  })

  test('active breakglass relations are provide as a team limited scope', async () => {
    const userid = 'user-4'
    const teamId = 'foo-team'
    await addUserToTeam(request.db, userid, teamId)

    const now = new Date()
    await grantTeamScopedPermissionToUser(
      request.db,
      userid,
      teamId,
      scopeDefinitions.breakGlass.scopeId,
      subHours(now, 1),
      addHours(now, 1)
    )

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        `permission:breakGlass:team:${teamId}`,
        `${scopes.serviceOwner}:team:${teamId}`,
        scopes.tenant,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: true }
    })
  })

  test('active breakglass relations can be revoked', async () => {
    const userid = 'user-4'
    const teamId = 'foo-team'
    await addUserToTeam(request.db, userid, teamId)

    const now = new Date()
    await grantTeamScopedPermissionToUser(
      request.db,
      userid,
      teamId,
      scopeDefinitions.breakGlass.scopeId,
      subHours(now, 1),
      addHours(now, 1)
    )

    await revokeTeamScopedPermissionFromUser(
      request.db,
      userid,
      teamId,
      scopeDefinitions.breakGlass.scopeId
    )

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        `${scopes.serviceOwner}:team:${teamId}`,
        scopes.tenant,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
    })
  })

  test('removing a permission from a user revokes just that permission', async () => {
    const userid = 'user1'
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.externalTest.scopeId
    )

    {
      const result = await scopesForUser(request.db, userid)
      expect(result).toEqual({
        scopes: [scopes.externalTest, `user:${userid}`],
        scopeFlags: { isAdmin: false, isTenant: false, hasBreakGlass: false }
      })
    }

    await revokePermissionFromUser(
      request.db,
      userid,
      scopeDefinitions.externalTest.scopeId
    )

    {
      const result = await scopesForUser(request.db, userid)
      expect(result).toEqual({
        scopes: [`user:${userid}`],
        scopeFlags: { isAdmin: false, isTenant: false, hasBreakGlass: false }
      })
    }
  })

  test('removing a permission from a team revokes cascades down to the user', async () => {
    const userid = 'user2'
    const teamId = 'platform'
    await grantPermissionToTeam(
      request.db,
      teamId,
      scopeDefinitions.externalTest.scopeId
    )
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.restrictedTechPython.scopeId
    )
    await addUserToTeam(request.db, userid, teamId)

    {
      const result = await scopesForUser(request.db, userid)
      expect(result).toEqual({
        scopes: [
          scopes.externalTest,
          scopes.restrictedTechPython,
          `${scopes.serviceOwner}:team:${teamId}`,
          scopes.tenant,
          `team:${teamId}`,
          `user:${userid}`
        ],
        scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
      })
    }

    await revokePermissionFromTeam(
      request.db,
      teamId,
      scopeDefinitions.externalTest.scopeId
    )

    {
      const result = await scopesForUser(request.db, userid)
      expect(result).toEqual({
        scopes: [
          scopes.restrictedTechPython,
          `${scopes.serviceOwner}:team:${teamId}`,
          scopes.tenant,
          `team:${teamId}`,
          `user:${userid}`
        ],
        scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
      })
    }
  })

  test('removing a user from a team stops them inheriting the teams permissions', async () => {
    const userid = 'user2'
    const teamId = 'platform'
    await grantPermissionToTeam(
      request.db,
      teamId,
      scopeDefinitions.externalTest.scopeId
    )
    await addUserToTeam(request.db, userid, teamId)

    await removeUserFromTeam(request.db, userid, teamId)

    {
      const result = await scopesForUser(request.db, userid)
      expect(result).toEqual({
        scopes: [`user:${userid}`],
        scopeFlags: { isAdmin: false, isTenant: false, hasBreakGlass: false }
      })
    }
  })

  test('admin scope is removed if user has testAsTenant as well', async () => {
    const userid = 'user-admin-3'
    const teamId = 'team-admin-3'
    await addUserToTeam(request.db, userid, teamId)
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.admin.scopeId
    )
    await grantPermissionToUser(
      request.db,
      userid,
      scopeDefinitions.testAsTenant.scopeId
    )

    const result = await scopesForUser(request.db, userid)
    expect(result).toEqual({
      scopes: [
        'permission:serviceOwner:team:team-admin-3',
        scopes.tenant,
        scopes.testAsTenant,
        `team:${teamId}`,
        `user:${userid}`
      ],
      scopeFlags: { isAdmin: false, isTenant: true, hasBreakGlass: false }
    })
  })
})
