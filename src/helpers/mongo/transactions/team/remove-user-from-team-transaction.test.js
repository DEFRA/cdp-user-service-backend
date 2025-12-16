import { removeUserFromTeamTransaction } from './remove-user-from-team-transaction.js'
import { addUserToTeamTransaction } from './add-user-to-team-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { userTenantWithoutTeamFixture } from '../../../../__fixtures__/users.js'
import { collections } from '../../../../../test-helpers/constants.js'
import { platformTeamFixture } from '../../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  externalTestScopeFixture
} from '../../../../__fixtures__/scopes.js'
import {
  deleteMany,
  replaceMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'

const request = {}
let replaceManyTestHelper, deleteManyTestHelper, replaceOneTestHelper

describe('#removeUserFromTeamTransaction', () => {
  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

    replaceOneTestHelper = replaceOne(db)
    replaceManyTestHelper = replaceMany(db)
    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([
      collections.team,
      collections.scope,
      collections.user
    ])
  })

  test('Should remove team scopes from a user and remove the user from team', async () => {
    const { db } = request
    const teamId = platformTeamFixture._id
    const userId = userTenantWithoutTeamFixture._id

    await replaceOneTestHelper(collections.team, platformTeamFixture)
    await replaceManyTestHelper(collections.scope, [
      adminScopeFixture,
      externalTestScopeFixture
    ])
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // First of all add a user to a team
    await addUserToTeamTransaction(request, userId, teamId)

    // Check the team has the user and the user has the team scopes
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(team.users).toEqual([...platformTeamFixture.users, userId])

    const user = await db.collection(collections.user).findOne({ _id: userId })

    expect(user.teams).toEqual([teamId])
    expect(user.scopes).toEqual([
      {
        scopeId: externalTestScopeFixture.scopeId,
        scopeName: externalTestScopeFixture.value
      },
      {
        scopeId: adminScopeFixture.scopeId,
        scopeName: adminScopeFixture.value
      }
    ])

    // Remove the user from the team
    await removeUserFromTeamTransaction({ request, userId, teamId })

    // Check the user has been removed from the team and the user no longer has the team scopes
    const updatedTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })

    expect(updatedTeam.users).toEqual(platformTeamFixture.users)

    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })

    expect(updatedUser.teams).toEqual([])
    expect(updatedUser.scopes).toEqual([])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const teamId = platformTeamFixture._id
    const userId = userTenantWithoutTeamFixture._id

    await replaceOneTestHelper(collections.team, platformTeamFixture)
    await replaceManyTestHelper(collections.scope, [
      adminScopeFixture,
      externalTestScopeFixture
    ])
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // Pre-transaction expectations. These are checked before and after a failed transaction to ensure no changes were made
    const preTransactionTeamUsers = [...platformTeamFixture.users, userId]
    const preTransactionUserTeams = [teamId]
    const preTransactionUserScopes = [
      {
        scopeId: externalTestScopeFixture.scopeId,
        scopeName: externalTestScopeFixture.value
      },
      {
        scopeId: adminScopeFixture.scopeId,
        scopeName: adminScopeFixture.value
      }
    ]

    // First of all add a user to a team
    await addUserToTeamTransaction(request, userId, teamId)

    // Check the team has the user and the user has the team scopes
    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.users).toEqual(preTransactionTeamUsers)

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.teams).toEqual(preTransactionUserTeams)
    expect(user.scopes).toEqual(preTransactionUserScopes)

    // Now throw an error when removing the user from the team
    const originalCollection = db.collection.bind(db)
    const collectionSpy = vi.spyOn(db, 'collection')

    collectionSpy
      .mockImplementationOnce((name) => originalCollection(name))
      .mockImplementationOnce(() => {
        // Force an error within the transaction
        throw new Error('Force rollback')
      })
      .mockImplementation((name) => originalCollection(name))

    await expect(
      removeUserFromTeamTransaction({ request, userId, teamId })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    // Check the team and user are unchanged
    const rolledBackTeam = await db
      .collection(collections.team)
      .findOne({ _id: teamId })
    expect(rolledBackTeam.users).toEqual(preTransactionTeamUsers)

    const rolledBackUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(rolledBackUser.teams).toEqual(preTransactionUserTeams)
    expect(rolledBackUser.scopes).toEqual(preTransactionUserScopes)
  })
})
