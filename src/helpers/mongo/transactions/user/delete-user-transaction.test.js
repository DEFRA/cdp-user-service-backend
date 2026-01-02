import { addHours } from 'date-fns'
import { scopes } from '@defra/cdp-validation-kit'

import { addUserToTeamTransaction } from '../team/add-user-to-team-transaction.js'
import { addScopeToUserTransaction } from '../scope/add-scope-to-user-transaction.js'
import { addScopeToTeamTransaction } from '../scope/add-scope-to-team-transaction.js'
import { addScopeToMemberTransaction } from '../scope/add-scope-to-member-transaction.js'
import { deleteUserTransaction } from './delete-user-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { createTestServer } from '../../../../../test-helpers/create-test-server.js'
import {
  userTenantFixture,
  userTenantWithoutTeamFixture
} from '../../../../__fixtures__/users.js'
import { collections } from '../../../../../test-helpers/constants.js'
import {
  teamWithoutUsers,
  tenantTeamFixture
} from '../../../../__fixtures__/teams.js'
import {
  canGrantBreakGlassScopeFixture,
  externalTestScopeFixture,
  testAsTenantScopeFixture
} from '../../../../__fixtures__/scopes.js'
import {
  deleteMany,
  replaceMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'
import { deleteUserController } from '../../../../api/users/controllers/delete-user.js'
import { getUserController } from '../../../../api/users/controllers/get-user.js'
import { getTeamController } from '../../../../api/teams/controllers/get-team.js'

const request = {}
const mockInfoLogger = vi.fn()
let replaceManyTestHelper, deleteManyTestHelper, replaceOneTestHelper

describe('#deleteUserTransaction', () => {
  beforeAll(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-09-11T08:09:00.000Z'))

    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
    request.logger = { info: mockInfoLogger }

    replaceManyTestHelper = replaceMany(db)
    replaceOneTestHelper = replaceOne(db)
    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([
      collections.scope,
      collections.team,
      collections.user
    ])
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('Should delete user', async () => {
    const { db } = request
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers
    const { _id: teamScopeId, value: teamScopeName } = externalTestScopeFixture
    const { _id: userScopeId, value: userScopeName } = testAsTenantScopeFixture
    const { _id: memberScopeId, value: memberScopeName } =
      canGrantBreakGlassScopeFixture

    const startDate = new Date()
    const endDate = addHours(startDate, 2)

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)
    await replaceManyTestHelper(collections.scope, [
      externalTestScopeFixture,
      testAsTenantScopeFixture,
      canGrantBreakGlassScopeFixture
    ])

    // First add the scope to the team
    await addScopeToTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId: teamScopeId,
      scopeName: teamScopeName
    })

    // Then add the user to the team
    await addUserToTeamTransaction(request, userId, teamId)

    // Then add a scope to team member
    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId: memberScopeId,
      scopeName: memberScopeName,
      teamId,
      teamName,
      startDate,
      endDate
    })
    // Then add a scope to the user
    await addScopeToUserTransaction({
      request,
      userId,
      userName,
      scopeId: userScopeId,
      scopeName: userScopeName
    })

    // Check the team has the user and the team scopes
    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.users).toEqual([userId])
    expect(team.scopes).toEqual([
      {
        scopeId: teamScopeId,
        scopeName: teamScopeName
      }
    ])

    // Check the user has the team, user and member scopes and is in the team
    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([
      {
        scopeId: teamScopeId,
        scopeName: teamScopeName
      },
      {
        scopeId: memberScopeId,
        scopeName: memberScopeName,
        teamId,
        teamName,
        startDate,
        endDate
      },
      {
        scopeId: userScopeId,
        scopeName: userScopeName
      }
    ])
    expect(user.teams).toEqual([teamId])

    // Check the team scope has the team
    const teamScope = await db
      .collection(collections.scope)
      .findOne({ _id: teamScopeId })

    expect(teamScope.teams).toEqual([
      ...externalTestScopeFixture.teams,
      { teamId, teamName }
    ])

    // Check the user scope has the users scope
    const userScope = await db
      .collection(collections.scope)
      .findOne({ _id: userScopeId })

    expect(userScope.users).toEqual([
      {
        userId,
        userName
      }
    ])

    // Check the member scope has the members scope
    const memberScope = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })

    expect(memberScope.members).toEqual([
      {
        userId,
        userName,
        teamId,
        teamName,
        startDate,
        endDate
      }
    ])

    // Now delete the user
    await deleteUserTransaction({
      request,
      userId
    })

    expect(mockInfoLogger).toHaveBeenCalledWith(
      `User ${userName} deleted from CDP`
    )

    // Check user has been deleted
    const deletedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(deletedUser).toBeNull()

    // Check user has been removed from team
    const updatedTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })
    expect(updatedTeam.users).toEqual([])
    expect(updatedTeam.scopes).toEqual([
      {
        scopeId: teamScopeId,
        scopeName: teamScopeName
      }
    ])

    // Check the teams are correct for the team scope
    const updatedTeamScope = await db
      .collection(collections.scope)
      .findOne({ _id: teamScopeId })

    expect(updatedTeamScope.teams).toEqual([
      ...externalTestScopeFixture.teams,
      { teamId, teamName }
    ])

    // Check the user has been removed from the user scope
    const updatedUserScope = await db
      .collection(collections.scope)
      .findOne({ _id: userScopeId })

    expect(updatedUserScope.users).toEqual([])

    // Check the member has been removed from the member scope
    const updatedMemberScope = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })

    expect(updatedMemberScope.members).toEqual([])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers
    const { _id: teamScopeId, value: teamScopeName } = externalTestScopeFixture
    const { _id: userScopeId, value: userScopeName } = testAsTenantScopeFixture
    const { _id: memberScopeId, value: memberScopeName } =
      canGrantBreakGlassScopeFixture

    const startDate = new Date()
    const endDate = addHours(startDate, 2)

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)
    await replaceManyTestHelper(collections.scope, [
      externalTestScopeFixture,
      testAsTenantScopeFixture,
      canGrantBreakGlassScopeFixture
    ])

    // First add the scope to the team
    await addScopeToTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId: teamScopeId,
      scopeName: teamScopeName
    })

    // Then add the user to the team
    await addUserToTeamTransaction(request, userId, teamId)

    // Then add a scope to team member
    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId: memberScopeId,
      scopeName: memberScopeName,
      teamId,
      teamName,
      startDate,
      endDate
    })
    // Then add a scope to the user
    await addScopeToUserTransaction({
      request,
      userId,
      userName,
      scopeId: userScopeId,
      scopeName: userScopeName
    })

    // Pre-transaction expectations. These are checked before and after a failed transaction to ensure no changes were made
    const preTransactionTeamUsers = [userId]
    const preTransactionTeamScopes = [
      { scopeId: teamScopeId, scopeName: teamScopeName }
    ]
    const preTransactionUserScopes = [
      { scopeId: teamScopeId, scopeName: teamScopeName },
      {
        scopeId: memberScopeId,
        scopeName: memberScopeName,
        teamId,
        teamName,
        startDate,
        endDate
      },
      { scopeId: userScopeId, scopeName: userScopeName }
    ]
    const preTransactionUserTeams = [teamId]
    const preTransactionTeamScopeTeams = [
      ...externalTestScopeFixture.teams,
      { teamId, teamName }
    ]
    const preTransactionUserScopeUsers = [{ userId, userName }]
    const preTransactionMemberScopeMembers = [
      {
        userId,
        userName,
        teamId,
        teamName,
        startDate,
        endDate
      }
    ]

    // Check the team has the user and the team scopes
    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.users).toEqual(preTransactionTeamUsers)
    expect(team.scopes).toEqual(preTransactionTeamScopes)

    // Check the user has the team, user and member scopes and is in the team
    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(preTransactionUserScopes)
    expect(user.teams).toEqual(preTransactionUserTeams)

    // Check the team scope has the team
    const teamScope = await db
      .collection(collections.scope)
      .findOne({ _id: teamScopeId })
    expect(teamScope.teams).toEqual(preTransactionTeamScopeTeams)

    // Check the user scope has the users scope
    const userScope = await db
      .collection(collections.scope)
      .findOne({ _id: userScopeId })
    expect(userScope.users).toEqual(preTransactionUserScopeUsers)

    // Check the member scope has the team
    const memberScope = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })
    expect(memberScope.members).toEqual(preTransactionMemberScopeMembers)

    // Now throw an error when deleting the user
    const originalCollection = db.collection.bind(db)
    const collectionSpy = vi.spyOn(db, 'collection')

    collectionSpy
      .mockImplementationOnce((name) => originalCollection(name))
      .mockImplementationOnce(() => {
        // Force an error within the transaction
        throw new Error('Force rollback')
      })

    await expect(
      deleteUserTransaction({
        request,
        userId
      })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    expect(mockInfoLogger).not.toHaveBeenCalled()

    // Check team, user and all scope are unchanged
    const rolledBackTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })
    expect(rolledBackTeam.users).toEqual(preTransactionTeamUsers)
    expect(rolledBackTeam.scopes).toEqual(preTransactionTeamScopes)

    const rolledBackUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(rolledBackUser.scopes).toEqual(preTransactionUserScopes)
    expect(rolledBackUser.teams).toEqual(preTransactionUserTeams)

    const rolledBackTeamScope = await db
      .collection(collections.scope)
      .findOne({ _id: teamScopeId })
    expect(rolledBackTeamScope.teams).toEqual(preTransactionTeamScopeTeams)

    const rolledBackUserScope = await db
      .collection(collections.scope)
      .findOne({ _id: userScopeId })
    expect(rolledBackUserScope.users).toEqual(preTransactionUserScopeUsers)

    const rolledBackMemberScope = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })
    expect(rolledBackMemberScope.members).toEqual(
      preTransactionMemberScopeMembers
    )
  })

  test('Should throw error when user does not exist in the db', async () => {
    await expect(
      deleteUserTransaction({
        request,
        userId: userTenantWithoutTeamFixture._id
      })
    ).rejects.toThrow(/User not found/)
  })
})

describe('DELETE /users/{userId} endpoint', () => {
  let server
  let replaceOneHelper
  let deleteManyHelper

  beforeAll(async () => {
    const { db } = await connectToTestMongoDB()
    replaceOneHelper = replaceOne(db)
    deleteManyHelper = deleteMany(db)

    server = await createTestServer({
      routes: [
        { method: 'DELETE', path: '/users/{userId}', ...deleteUserController },
        { method: 'GET', path: '/users/{userId}', ...getUserController },
        { method: 'GET', path: '/teams/{teamId}', ...getTeamController }
      ],
      defaultAuthScopes: [scopes.admin]
    })
  })

  afterEach(async () => {
    await deleteManyHelper([collections.user, collections.team])
  })

  test('Should return 404 when user does not exist', async () => {
    const { result, statusCode } = await server.inject({
      method: 'DELETE',
      url: '/users/8469dcf7-846d-43fd-899a-9850bc43298b',
      auth: {
        strategy: 'azure-oidc',
        credentials: { scope: [scopes.admin] }
      }
    })

    expect(statusCode).toBe(404)
    expect(result).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found'
    })
  })

  test('Should return 200 and delete user', async () => {
    await replaceOneHelper(collections.user, userTenantWithoutTeamFixture)

    const { statusCode } = await server.inject({
      method: 'DELETE',
      url: `/users/${userTenantWithoutTeamFixture._id}`,
      auth: {
        strategy: 'azure-oidc',
        credentials: { scope: [scopes.admin] }
      }
    })

    expect(statusCode).toBe(200)

    // Verify user was deleted via GET endpoint
    const { statusCode: getStatusCode } = await server.inject({
      method: 'GET',
      url: `/users/${userTenantWithoutTeamFixture._id}`
    })
    expect(getStatusCode).toBe(404)
  })

  test('Should remove user from team when deleted', async () => {
    await replaceOneHelper(collections.user, userTenantFixture)
    await replaceOneHelper(collections.team, tenantTeamFixture)

    await server.inject({
      method: 'DELETE',
      url: `/users/${userTenantFixture._id}`,
      auth: {
        strategy: 'azure-oidc',
        credentials: { scope: [scopes.admin] }
      }
    })

    // Verify team no longer has user via GET endpoint
    const { result: teamResult } = await server.inject({
      method: 'GET',
      url: `/teams/${tenantTeamFixture._id}`
    })
    expect(teamResult.users).toEqual([])
  })

  test('Should return 401 without authentication', async () => {
    const { statusCode, result } = await server.inject({
      method: 'DELETE',
      url: `/users/${userTenantFixture._id}`
    })

    expect(statusCode).toBe(401)
    expect(result).toMatchObject({
      message: 'Missing authentication'
    })
  })

  test('Should return 403 without admin scope', async () => {
    const { statusCode } = await server.inject({
      method: 'DELETE',
      url: `/users/${userTenantFixture._id}`,
      auth: {
        strategy: 'azure-oidc',
        credentials: { scope: [] } // No scopes
      }
    })

    expect(statusCode).toBe(403)
  })
})
