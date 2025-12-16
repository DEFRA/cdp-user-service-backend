import Boom from '@hapi/boom'

import { addScopeToUser } from './add-scope-to-user.js'
import { collections } from '../../../../test-helpers/constants.js'
import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { addScopeToUserTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'
import {
  replaceOne,
  deleteMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  userAdminFixture,
  userAdminOtherFixture,
  userAdminWithTeamBreakGlassFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  adminScopeFixture,
  breakGlassScopeFixture,
  terminalScopeFixture
} from '../../../__fixtures__/scopes.js'

vi.mock('@azure/identity')

const request = {}
let replaceOneTestHelper, deleteManyTestHelper

vi.mock(
  '../../../helpers/mongo/transactions/scope/add-scope-to-user-transaction.js'
)

describe('#addScopeToUser', () => {
  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

    replaceOneTestHelper = replaceOne(db)
    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([collections.user, collections.scope])
  })

  test('Successfully adds scope to user when all conditions are met', async () => {
    await replaceOneTestHelper(collections.user, userAdminOtherFixture)
    await replaceOneTestHelper(collections.scope, breakGlassScopeFixture)

    await addScopeToUser({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: breakGlassScopeFixture.scopeId
    })

    expect(addScopeToUserTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      userName: userAdminOtherFixture.name,
      scopeId: breakGlassScopeFixture.scopeId,
      scopeName: breakGlassScopeFixture.value
    })
  })

  test('Should throw not found error when user does not exist', async () => {
    await replaceOneTestHelper(collections.user, userTenantFixture)
    await replaceOneTestHelper(collections.scope, breakGlassScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: breakGlassScopeFixture.scopeId
      })
    ).rejects.toThrow(Boom.notFound('User not found'))
  })

  test('Should throw not found error when scope does not exist', async () => {
    await replaceOneTestHelper(collections.user, userTenantFixture)
    await replaceOneTestHelper(collections.scope, breakGlassScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userTenantFixture._id,
        scopeId: adminScopeFixture.scopeId
      })
    ).rejects.toThrow(Boom.notFound('Scope not found'))
  })

  test('Throws bad request error when scope cannot be applied to a user', async () => {
    await replaceOneTestHelper(collections.user, userAdminFixture)
    await replaceOneTestHelper(collections.scope, terminalScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: terminalScopeFixture.scopeId
      })
    ).rejects.toThrow(Boom.badRequest('Scope cannot be applied to a user'))
  })

  test('Throws bad request error when user already has this scope assigned', async () => {
    await replaceOneTestHelper(
      collections.user,
      userAdminWithTeamBreakGlassFixture
    )
    await replaceOneTestHelper(collections.scope, breakGlassScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminWithTeamBreakGlassFixture._id,
        scopeId: breakGlassScopeFixture.scopeId
      })
    ).rejects.toThrow(Boom.badRequest('User already has this scope assigned'))
  })
})
