import Boom from '@hapi/boom'

import { addScopeToUser } from './add-scope-to-user.js'
import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { addScopeToUserTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'
import {
  replaceOne,
  deleteMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  userAdminFixture,
  userAdminOtherFixture,
  userAdminWithTeamProdAccessFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  adminScopeFixture,
  prodAccessScopeFixture,
  terminalScopeFixture
} from '../../../__fixtures__/scopes.js'

vi.mock('@azure/identity')

const userCollection = 'users'
const scopeCollection = 'scopes'
const request = {}
let replaceOneTestHelper

vi.mock(
  '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'
)

beforeAll(async () => {
  const { db, client } = await connectToTestMongoDB()
  request.db = db
  request.client = client

  replaceOneTestHelper = replaceOne(db)
})

beforeEach(async () => {
  await deleteMany(request.db)([userCollection, scopeCollection])
})

describe('#addScopeToUser', () => {
  test('Successfully adds scope to user when all conditions are met', async () => {
    await replaceOneTestHelper(userCollection, userAdminOtherFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await addScopeToUser({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: prodAccessScopeFixture._id.toHexString() // mimic string being passed via api endpoint
    })

    expect(addScopeToUserTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      userName: userAdminOtherFixture.name,
      scopeId: prodAccessScopeFixture._id.toHexString(),
      scopeName: prodAccessScopeFixture.value
    })
  })

  test('Should throw not found error when user does not exist', async () => {
    await replaceOneTestHelper(userCollection, userTenantFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: prodAccessScopeFixture._id.toHexString() // mimic string being passed via api endpoint
      })
    ).rejects.toThrow(Boom.notFound('User not found'))
  })

  test('Should throw not found error when scope does not exist', async () => {
    await replaceOneTestHelper(userCollection, userTenantFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userTenantFixture._id,
        scopeId: adminScopeFixture._id.toHexString() // mimic string being passed via api endpoint
      })
    ).rejects.toThrow(Boom.notFound('Scope not found'))
  })

  test('Throws bad request error when scope cannot be applied to a user', async () => {
    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, terminalScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: terminalScopeFixture._id.toHexString() // mimic string being passed via api endpoint
      })
    ).rejects.toThrow(Boom.badRequest('Scope cannot be applied to a user'))
  })

  test('Throws bad request error when user already has this scope assigned', async () => {
    await replaceOneTestHelper(
      userCollection,
      userAdminWithTeamProdAccessFixture
    )
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminWithTeamProdAccessFixture._id,
        scopeId: prodAccessScopeFixture._id.toHexString() // mimic string being passed via api endpoint
      })
    ).rejects.toThrow(Boom.badRequest('User already has this scope assigned'))
  })
})
