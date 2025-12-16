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

describe('#addScopeToUserTransaction', () => {
  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

    replaceOneTestHelper = replaceOne(db)
    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([collections.scope, collections.user])
  })

  test('Should add scope to user', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

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

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.users).toEqual([
      {
        userId,
        userName
      }
    ])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

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
      addScopeToUserTransaction({
        request,
        userId,
        userName,
        scopeId,
        scopeName
      })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.users).toEqual(externalTestScopeFixture.users)
  })
})
