import { removeScopeFromUserTransaction } from './remove-scope-from-user-transaction.js'
import { addScopeToUserTransaction } from './add-scope-to-user-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { userTenantWithoutTeamFixture } from '../../../../__fixtures__/users.js'
import { externalTestScopeFixture } from '../../../../__fixtures__/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'
import {
  deleteMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'

const request = {}
let deleteManyTestHelper, replaceOneTestHelper

describe('#removeScopeFromUserTransaction', () => {
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

  test('Should remove scope from user', async () => {
    const { db } = request
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // First off add scope to the user
    await addScopeToUserTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName
    })

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([
      {
        scopeId,
        scopeName
      }
    ])

    const scope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(scope.users).toEqual([
      {
        userId,
        userName
      }
    ])

    // Remove scope from user
    await removeScopeFromUserTransaction({ request, userId, scopeId })

    // Check the scope has been removed from the user and scope correctly
    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual([])

    const updatedScope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(updatedScope.users).toEqual([])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const { _id: scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // First off add scope to the user
    await addScopeToUserTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName
    })

    // Pre-transaction expectations. These are checked before and after a failed transaction to ensure no changes were made
    const preTransactionUserScopes = [{ scopeId, scopeName }]
    const preTransactionScopeUsers = [{ userId, userName }]

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(preTransactionUserScopes)

    const scope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(scope.users).toEqual(preTransactionScopeUsers)

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
      removeScopeFromUserTransaction({ request, userId, scopeId })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    // Check user and scope are unchanged
    const rolledBackUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(rolledBackUser.scopes).toEqual(preTransactionUserScopes)

    const rolledBackScope = await db
      .collection(collections.scope)
      .findOne({ _id: scopeId })
    expect(rolledBackScope.users).toEqual(preTransactionScopeUsers)
  })
})
