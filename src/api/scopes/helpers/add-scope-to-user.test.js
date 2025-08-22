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
  userAdminWithTeamBreakGlassFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  prodAccessScopeFixture,
  terminalScopeFixture
} from '../../../__fixtures__/scopes.js'

vi.mock('@azure/identity')

const userCollection = 'users'
const scopeCollection = 'scopes'
const teamCollection = 'teams'
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
  await deleteMany(request.db)([
    userCollection,
    scopeCollection,
    teamCollection
  ])
})

describe('#addScopeToUser', () => {
  test('Successfully adds scope with teamId to user when all conditions are met', async () => {
    await replaceOneTestHelper(userCollection, userAdminOtherFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)
    await replaceOneTestHelper(teamCollection, platformTeamFixture)

    await addScopeToUser({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: prodAccessScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
      teamId: platformTeamFixture._id
    })

    expect(addScopeToUserTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: prodAccessScopeFixture._id.toHexString(),
      teamId: platformTeamFixture._id,
      startDate: undefined,
      endDate: undefined
    })
  })

  test('Successfully adds scope without teamId to user when all conditions are met', async () => {
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
      scopeId: prodAccessScopeFixture._id.toHexString(),
      teamId: undefined,
      startDate: undefined,
      endDate: undefined
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

  test('Throws not found error when team does not exist', async () => {
    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, adminScopeFixture)
    await replaceOneTestHelper(teamCollection, tenantTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id
      })
    ).rejects.toThrow(Boom.notFound('Team not found'))
  })

  test('Throws bad request error when user is not a member of the team', async () => {
    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, adminScopeFixture)
    await replaceOneTestHelper(teamCollection, tenantTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: tenantTeamFixture._id
      })
    ).rejects.toThrow(Boom.badRequest('User is not a member of the team'))
  })

  test('Throws bad request error when start date is after or equal to end date', async () => {
    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, adminScopeFixture)
    await replaceOneTestHelper(teamCollection, platformTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id,
        startDate: new Date('2025-01-02'),
        endDate: new Date('2025-01-01')
      })
    ).rejects.toThrow(Boom.badRequest('Start date must be before End date'))
  })

  test('Throws bad request error when scope cannot be applied to a user', async () => {
    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, terminalScopeFixture)
    await replaceOneTestHelper(teamCollection, platformTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: terminalScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id
      })
    ).rejects.toThrow(Boom.badRequest('Scope cannot be applied to a user'))
  })

  test('Throws bad request error when user already has this scope assigned', async () => {
    await replaceOneTestHelper(
      userCollection,
      userAdminWithTeamBreakGlassFixture
    )
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)
    await replaceOneTestHelper(teamCollection, platformTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminWithTeamBreakGlassFixture._id,
        scopeId: prodAccessScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id
      })
    ).rejects.toThrow(Boom.badRequest('User already has this scope assigned'))
  })
})
