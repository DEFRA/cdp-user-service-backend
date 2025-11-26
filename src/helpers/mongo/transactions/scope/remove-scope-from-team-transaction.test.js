import { removeScopeFromTeamTransaction } from './remove-scope-from-team-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { userTenantWithoutTeamFixture } from '../../../../__fixtures__/users.js'
import { teamWithoutUsers } from '../../../../__fixtures__/teams.js'
import { externalTestScopeFixture } from '../../../../__fixtures__/scopes.js'
import { addUserToTeamTransaction } from '../team/add-user-to-team-transaction.js'
import { addScopeToTeamTransaction } from './add-scope-to-team-transaction.js'
import { collections } from '../../../../../test-helpers/constants.js'
import {
  deleteMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'

const request = {}
let deleteManyTestHelper, replaceOneTestHelper

describe('#removeScopeFromTeamTransaction', () => {
  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

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

  test('Should remove scope from team and all team users', async () => {
    const { db } = request
    const userId = userTenantWithoutTeamFixture._id
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)

    // Add scope to team
    await addScopeToTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId,
      scopeName
    })
    // Add user to team
    await addUserToTeamTransaction(request, userId, teamId)

    // Check team, user and scopes are correct
    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.users).toEqual([userId])
    expect(team.scopes).toEqual([{ scopeId, scopeName }])

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([{ scopeId, scopeName }])

    const scope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(scope.teams).toEqual([
      ...externalTestScopeFixture.teams,
      { teamId, teamName }
    ])

    // Remove scope from team
    await removeScopeFromTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId,
      scopeName
    })

    // Check the scope has been removed from the team, user and scope correctly
    const updatedTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })
    expect(updatedTeam.users).toEqual([userId])
    expect(updatedTeam.scopes).toEqual(teamWithoutUsers.scopes)

    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    const updatedScope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(updatedScope.teams).toEqual(externalTestScopeFixture.teams)
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const userId = userTenantWithoutTeamFixture._id
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)

    // Add scope to team
    await addScopeToTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId,
      scopeName
    })
    // Add user to team
    await addUserToTeamTransaction(request, userId, teamId)

    // Pre-transaction expectations. These are checked before and after a failed transaction to ensure no changes were made
    const preTransactionTeamUsers = [userId]
    const preTransactionTeamScopes = [{ scopeId, scopeName }]
    const preTransactionUserScopes = [{ scopeId, scopeName }]
    const preTransactionScopeTeams = [
      ...externalTestScopeFixture.teams,
      { teamId, teamName }
    ]

    // Check team, user and scopes are correct
    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.users).toEqual(preTransactionTeamUsers)
    expect(team.scopes).toEqual(preTransactionTeamScopes)

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(preTransactionUserScopes)

    const scope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(scope.teams).toEqual(preTransactionScopeTeams)

    // Now throw an error when removing scope from team
    const originalCollection = db.collection.bind(db)
    const collectionSpy = vi.spyOn(db, 'collection')

    collectionSpy
      .mockImplementationOnce((name) => originalCollection(name))
      .mockImplementationOnce(() => {
        // Force an error within the transaction
        throw new Error('Force rollback')
      })

    await expect(
      removeScopeFromTeamTransaction({
        request,
        teamId,
        teamName,
        scopeId,
        scopeName
      })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    // Check the team, users and scope are unchanged
    const rolledBackTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })
    expect(rolledBackTeam.users).toEqual(preTransactionTeamUsers)
    expect(rolledBackTeam.scopes).toEqual(preTransactionTeamScopes)

    const rolledBackUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(rolledBackUser.scopes).toEqual(preTransactionUserScopes)

    const rolledBackScope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(rolledBackScope.teams).toEqual(preTransactionScopeTeams)
  })

  test('Removing scope for one team revokes users even when another team still grants it', async () => {
    const { db } = request
    const userId = userTenantWithoutTeamFixture._id
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: firstTeamId, name: firstTeamName } = teamWithoutUsers
    const secondTeam = {
      ...teamWithoutUsers,
      _id: 'teamwithoutusers-two',
      name: 'TeamWithoutUsersTwo',
      users: [],
      scopes: []
    }

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)
    await replaceOneTestHelper(collections.team, secondTeam)

    await addScopeToTeamTransaction({
      request,
      teamId: firstTeamId,
      teamName: firstTeamName,
      scopeId,
      scopeName
    })
    await addScopeToTeamTransaction({
      request,
      teamId: secondTeam._id,
      teamName: secondTeam.name,
      scopeId,
      scopeName
    })

    await addUserToTeamTransaction(request, userId, firstTeamId)
    await addUserToTeamTransaction(request, userId, secondTeam._id)

    const initialUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(initialUser.scopes).toEqual([{ scopeId, scopeName }])

    await removeScopeFromTeamTransaction({
      request,
      teamId: firstTeamId,
      teamName: firstTeamName,
      scopeId,
      scopeName
    })

    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual([{ scopeId, scopeName }])

    const scope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(scope.teams).toEqual([
      ...externalTestScopeFixture.teams,
      { teamId: secondTeam._id, teamName: secondTeam.name }
    ])
  })
})
