import { addHours } from 'date-fns'

import { deleteScopeTransaction } from './delete-scope-transaction.js'
import { addUserToTeamTransaction } from '../team/add-user-to-team-transaction.js'
import { addScopeToUserTransaction } from '../scope/add-scope-to-user-transaction.js'
import { addScopeToTeamTransaction } from '../scope/add-scope-to-team-transaction.js'
import { addScopeToMemberTransaction } from '../scope/add-scope-to-member-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { userTenantWithoutTeamFixture } from '../../../../__fixtures__/users.js'
import { tenantTeamFixture } from '../../../../__fixtures__/teams.js'
import { collections } from '../../../../../test-helpers/constants.js'
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

const request = {}
const mockInfoLogger = vi.fn()
let replaceManyTestHelper, deleteManyTestHelper, replaceOneTestHelper

describe('#deleteScopeTransaction', () => {
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

  test('Should delete scope. Remove scope from teams and remove scope from users', async () => {
    const { db } = request
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = tenantTeamFixture
    const { _id: teamScopeId, value: teamScopeName } = externalTestScopeFixture
    const { _id: userScopeId, value: userScopeName } = testAsTenantScopeFixture
    const { _id: memberScopeId, value: memberScopeName } =
      canGrantBreakGlassScopeFixture

    const startDate = new Date()
    const endDate = addHours(startDate, 2)

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)
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
    expect(team.users).toEqual([...tenantTeamFixture.users, userId])
    expect(team.scopes).toEqual([
      ...tenantTeamFixture.scopes,
      { scopeId: teamScopeId, scopeName: teamScopeName }
    ])

    // Check the user has the team, user and member scopes and is in the team
    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([
      ...tenantTeamFixture.scopes,
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

    expect(userScope.users).toEqual([{ userId, userName }])

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

    // Now delete all three scopes
    await Promise.all(
      [teamScopeId, userScopeId, memberScopeId].map((scopeId) =>
        deleteScopeTransaction({
          request,
          scopeId
        })
      )
    )

    expect(mockInfoLogger).toHaveBeenCalledWith(
      `Scope ${teamScopeName} deleted from CDP`
    )
    expect(mockInfoLogger).toHaveBeenCalledWith(
      `Scope ${userScopeName} deleted from CDP`
    )
    expect(mockInfoLogger).toHaveBeenCalledWith(
      `Scope ${memberScopeName} deleted from CDP`
    )

    // Check team scope has been deleted
    const deletedTeamScope = await db
      .collection(collections.scope)
      .findOne({ _id: teamScopeId })
    expect(deletedTeamScope).toBeNull()

    // Check user scope has been deleted
    const deletedUserScopeId = await db
      .collection(collections.scope)
      .findOne({ _id: userScopeId })
    expect(deletedUserScopeId).toBeNull()

    // Check member scope has been deleted
    const deletedMemberScopeId = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })
    expect(deletedMemberScopeId).toBeNull()

    // Check that all deleted scopes have been removed from the team, non deleted should remain
    const updatedTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })
    expect(updatedTeam.scopes).toEqual(tenantTeamFixture.scopes)

    // Check the user has had the deleted scopes removed, non deleted should remain
    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual(tenantTeamFixture.scopes)
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = tenantTeamFixture
    const { _id: teamScopeId, value: teamScopeName } = externalTestScopeFixture
    const { _id: userScopeId, value: userScopeName } = testAsTenantScopeFixture
    const { _id: memberScopeId, value: memberScopeName } =
      canGrantBreakGlassScopeFixture

    const startDate = new Date()
    const endDate = addHours(startDate, 2)

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)
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
    const preTransactionTeamUsers = [...tenantTeamFixture.users, userId]
    const preTransactionTeamScopes = [
      ...tenantTeamFixture.scopes,
      { scopeId: teamScopeId, scopeName: teamScopeName }
    ]
    const preTransactionUserScopes = [
      ...tenantTeamFixture.scopes,
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

    // Check the member scope has the members scope
    const memberScope = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })
    expect(memberScope.members).toEqual(preTransactionMemberScopeMembers)

    // Now throw an error when deleting the three scopes
    const collectionSpy = vi.spyOn(db, 'collection')

    collectionSpy.mockImplementation(() => {
      // Force an error within the transaction
      throw new Error('Force rollback')
    })

    await expect(
      Promise.all(
        [teamScopeId, userScopeId, memberScopeId].map((scopeId) =>
          deleteScopeTransaction({
            request,
            scopeId
          })
        )
      )
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    expect(mockInfoLogger).not.toHaveBeenCalled()

    // Check scopes, team and user are unchanged
    const rolledBackTeamScopeId = await db
      .collection(collections.scope)
      .findOne({ _id: teamScopeId })
    expect(rolledBackTeamScopeId).not.toBeNull()

    const rolledBackUserScopeId = await db
      .collection(collections.scope)
      .findOne({ _id: userScopeId })
    expect(rolledBackUserScopeId).not.toBeNull()

    const rolledBackMemberScopeId = await db
      .collection(collections.scope)
      .findOne({ _id: memberScopeId })
    expect(rolledBackMemberScopeId).not.toBeNull()

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

  test('Should throw error when scope does not exist in the db', async () => {
    await expect(
      deleteScopeTransaction({
        request,
        scopeId: externalTestScopeFixture._id
      })
    ).rejects.toThrow(/Scope not found/)
  })
})
