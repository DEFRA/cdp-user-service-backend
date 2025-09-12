import { removeScopeFromTeamTransaction } from './remove-scope-from-team-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { userTenantWithoutTeamFixture } from '../../../../__fixtures__/users.js'
import { teamWithoutUsers } from '../../../../__fixtures__/teams.js'
import { externalTestScopeFixture } from '../../../../__fixtures__/scopes.js'
import { addUserToTeamTransaction } from '../team/add-user-to-team-transaction.js'
import { addScopeToTeamTransaction } from './add-scope-to-team-transaction.js'
import {
  deleteMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'
import {
  scopeCollectionName,
  teamCollectionName,
  userCollectionName
} from '../../../../../test-helpers/collections.js'

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
      scopeCollectionName,
      teamCollectionName,
      userCollectionName
    ])
  })

  test('Should remove scope from team and all team users', async () => {
    const { db } = request
    const userId = userTenantWithoutTeamFixture._id
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(userCollectionName, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(scopeCollectionName, externalTestScopeFixture)
    await replaceOneTestHelper(teamCollectionName, teamWithoutUsers)

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
    const team = await db
      .collection(teamCollectionName)
      .findOne({ _id: teamId })
    expect(team.users).toEqual([userId])
    expect(team.scopes).toEqual([{ scopeId, scopeName }])

    const user = await db
      .collection(userCollectionName)
      .findOne({ _id: userId })
    expect(user.scopes).toEqual([{ scopeId, scopeName }])

    const scope = await db
      .collection(scopeCollectionName)
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
      .collection(teamCollectionName)
      .findOne({ _id: teamId })
    expect(updatedTeam.users).toEqual([userId])
    expect(updatedTeam.scopes).toEqual(teamWithoutUsers.scopes)

    const updatedUser = await db
      .collection(userCollectionName)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    const updatedScope = await db
      .collection(scopeCollectionName)
      .findOne({ _id: scopeId })
    expect(updatedScope.teams).toEqual(externalTestScopeFixture.teams)
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const userId = userTenantWithoutTeamFixture._id
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(userCollectionName, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(scopeCollectionName, externalTestScopeFixture)
    await replaceOneTestHelper(teamCollectionName, teamWithoutUsers)

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

    const preTransactionTeamUsers = [userId]
    const preTransactionTeamScopes = [{ scopeId, scopeName }]
    const preTransactionUserScopes = [{ scopeId, scopeName }]
    const preTransactionScopeTeams = [
      ...externalTestScopeFixture.teams,
      { teamId, teamName }
    ]

    // Check team, user and scopes are correct
    const team = await db
      .collection(teamCollectionName)
      .findOne({ _id: teamId })
    expect(team.users).toEqual(preTransactionTeamUsers)
    expect(team.scopes).toEqual(preTransactionTeamScopes)

    const user = await db
      .collection(userCollectionName)
      .findOne({ _id: userId })
    expect(user.scopes).toEqual(preTransactionUserScopes)

    const scope = await db
      .collection(scopeCollectionName)
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
      .collection(teamCollectionName)
      .findOne({ _id: teamId })
    expect(rolledBackTeam.users).toEqual(preTransactionTeamUsers)
    expect(rolledBackTeam.scopes).toEqual(preTransactionTeamScopes)

    const rolledBackUser = await db
      .collection(userCollectionName)
      .findOne({ _id: userId })
    expect(rolledBackUser.scopes).toEqual(preTransactionUserScopes)

    const rolledBackScope = await db
      .collection(scopeCollectionName)
      .findOne({ _id: scopeId })
    expect(rolledBackScope.teams).toEqual(preTransactionScopeTeams)
  })
})
