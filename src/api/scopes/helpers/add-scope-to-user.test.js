import Boom from '@hapi/boom'

import { addScopeToUser } from './add-scope-to-user.js'
import { addYears } from '../../../helpers/date/add-years.js'
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
  userTenantFixture,
  userWithGranularScopesFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  canGrantProdAccessScopeFixture,
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

const generateDates = () => {
  const now = new Date()
  const startDate = now
  const endDate = addYears(now, 100)

  return { startDate, endDate }
}

beforeAll(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-08-12T14:16:00.000Z'))

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
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userAdminOtherFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)
    await replaceOneTestHelper(teamCollection, platformTeamFixture)

    await addScopeToUser({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: prodAccessScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
      teamId: platformTeamFixture._id,
      startDate,
      endDate
    })

    expect(addScopeToUserTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      userName: userAdminOtherFixture.name,
      scopeId: prodAccessScopeFixture._id.toHexString(),
      scopeName: prodAccessScopeFixture.value,
      teamId: platformTeamFixture._id,
      teamName: platformTeamFixture.name,
      startDate,
      endDate
    })
  })

  test('Successfully adds scope without teamId to user when all conditions are met', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userAdminOtherFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await addScopeToUser({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: prodAccessScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
      startDate,
      endDate
    })

    expect(addScopeToUserTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      userName: userAdminOtherFixture.name,
      scopeId: prodAccessScopeFixture._id.toHexString(),
      scopeName: prodAccessScopeFixture.value,
      teamId: undefined,
      teamName: undefined,
      startDate,
      endDate
    })
  })

  test('Should throw not found error when user does not exist', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userTenantFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: prodAccessScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.notFound('User not found'))
  })

  test('Should throw not found error when scope does not exist', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userTenantFixture)
    await replaceOneTestHelper(scopeCollection, prodAccessScopeFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userTenantFixture._id,
        scopeId: adminScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.notFound('Scope not found'))
  })

  test('Throws not found error when team does not exist', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, adminScopeFixture)
    await replaceOneTestHelper(teamCollection, tenantTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.notFound('Team not found'))
  })

  test('Throws bad request error when user is not a member of the team', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, adminScopeFixture)
    await replaceOneTestHelper(teamCollection, tenantTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: tenantTeamFixture._id,
        startDate,
        endDate
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
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userAdminFixture)
    await replaceOneTestHelper(scopeCollection, terminalScopeFixture)
    await replaceOneTestHelper(teamCollection, platformTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userAdminFixture._id,
        scopeId: terminalScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.badRequest('Scope cannot be applied to a user'))
  })

  test('Throws bad request error when user already has this scope assigned without team id', async () => {
    const { startDate, endDate } = generateDates()

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
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.badRequest('User already has this scope assigned'))
  })

  test('Throws bad request error when user already has this scope assigned with team id and its active', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(userCollection, userWithGranularScopesFixture)
    await replaceOneTestHelper(scopeCollection, canGrantProdAccessScopeFixture)
    await replaceOneTestHelper(teamCollection, tenantTeamFixture)

    await expect(
      addScopeToUser({
        request,
        userId: userWithGranularScopesFixture._id,
        scopeId: canGrantProdAccessScopeFixture._id.toHexString(), // mimic string being passed via api endpoint
        teamId: tenantTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.badRequest('User already has this scope assigned'))
  })
})
