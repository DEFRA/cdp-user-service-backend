import Boom from '@hapi/boom'
import { addYears } from 'date-fns'

import { addScopeToMember } from './add-scope-to-member.js'
import { collections } from '../../../../test-helpers/constants.js'
import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { addScopeToMemberTransaction } from '../../../helpers/mongo/transactions/scope/add-scope-to-member-transaction.js'
import {
  replaceOne,
  deleteMany
} from '../../../../test-helpers/mongo-helpers.js'
import {
  userAdminFixture,
  userAdminOtherFixture,
  userTenantFixture,
  memberWithGranularScopesFixture
} from '../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  tenantTeamFixture
} from '../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  canGrantBreakGlassScopeFixture,
  breakGlassScopeFixture,
  terminalScopeFixture
} from '../../../__fixtures__/scopes.js'

vi.mock('@azure/identity')

const request = {}
let replaceOneTestHelper

vi.mock(
  '../../../helpers/mongo/transactions/scope/add-scope-to-member-transaction.js'
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

  const { db, mongoClient } = await connectToTestMongoDB()
  request.db = db
  request.mongoClient = mongoClient

  replaceOneTestHelper = replaceOne(db)
})

beforeEach(async () => {
  await deleteMany(request.db)([
    collections.user,
    collections.scope,
    collections.team
  ])
})

afterAll(() => {
  vi.useRealTimers()
})

describe('#addScopeToMember', () => {
  test('Successfully adds scope with teamId to member when all conditions are met', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(collections.user, userAdminOtherFixture)
    await replaceOneTestHelper(
      collections.scope,
      canGrantBreakGlassScopeFixture
    )
    await replaceOneTestHelper(collections.team, platformTeamFixture)

    await addScopeToMember({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: canGrantBreakGlassScopeFixture.scopeId, // mimic string being passed via api endpoint
      teamId: platformTeamFixture._id,
      startDate,
      endDate
    })

    expect(addScopeToMemberTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      userName: userAdminOtherFixture.name,
      scopeId: canGrantBreakGlassScopeFixture.scopeId,
      scopeName: canGrantBreakGlassScopeFixture.value,
      teamId: platformTeamFixture._id,
      teamName: platformTeamFixture.name,
      startDate,
      endDate
    })
  })

  test('Successfully adds scope to member without dates', async () => {
    await replaceOneTestHelper(collections.user, userAdminOtherFixture)
    await replaceOneTestHelper(
      collections.scope,
      canGrantBreakGlassScopeFixture
    )
    await replaceOneTestHelper(collections.team, platformTeamFixture)

    await addScopeToMember({
      request,
      userId: userAdminOtherFixture._id,
      scopeId: canGrantBreakGlassScopeFixture.scopeId, // mimic string being passed via api endpoint
      teamId: platformTeamFixture._id
    })

    expect(addScopeToMemberTransaction).toHaveBeenCalledWith({
      request,
      userId: userAdminOtherFixture._id,
      userName: userAdminOtherFixture.name,
      scopeId: canGrantBreakGlassScopeFixture.scopeId,
      scopeName: canGrantBreakGlassScopeFixture.value,
      teamId: platformTeamFixture._id,
      teamName: platformTeamFixture.name
    })
  })

  test('Should throw not found error when user does not exist', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(collections.user, userTenantFixture)
    await replaceOneTestHelper(collections.scope, breakGlassScopeFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: userAdminFixture._id,
        scopeId: breakGlassScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: userTenantFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.notFound('User not found'))
  })

  test('Should throw not found error when scope does not exist', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(collections.user, userTenantFixture)
    await replaceOneTestHelper(collections.scope, breakGlassScopeFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: userTenantFixture._id,
        scopeId: adminScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: tenantTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.notFound('Scope not found'))
  })

  test('Throws not found error when team does not exist', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(collections.user, userAdminFixture)
    await replaceOneTestHelper(collections.scope, adminScopeFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.notFound('Team not found'))
  })

  test('Throws bad request error when user is not a member of the team', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(collections.user, userAdminFixture)
    await replaceOneTestHelper(collections.scope, adminScopeFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: tenantTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(Boom.badRequest('User is not a member of the team'))
  })

  test('Throws bad request error when start date is after or equal to end date', async () => {
    await replaceOneTestHelper(collections.user, userAdminFixture)
    await replaceOneTestHelper(collections.scope, adminScopeFixture)
    await replaceOneTestHelper(collections.team, platformTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: userAdminFixture._id,
        scopeId: adminScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id,
        startDate: new Date('2025-01-02'),
        endDate: new Date('2025-01-01')
      })
    ).rejects.toThrow(Boom.badRequest('Start date must be before End date'))
  })

  test('Throws bad request error when scope cannot be applied to a user', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(collections.user, userAdminFixture)
    await replaceOneTestHelper(collections.scope, terminalScopeFixture)
    await replaceOneTestHelper(collections.team, platformTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: userAdminFixture._id,
        scopeId: terminalScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: platformTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(
      Boom.badRequest('Scope cannot be applied to a team member')
    )
  })

  test('Throws bad request error when user already has this scope assigned with team id and its active', async () => {
    const { startDate, endDate } = generateDates()

    await replaceOneTestHelper(
      collections.user,
      memberWithGranularScopesFixture
    )
    await replaceOneTestHelper(
      collections.scope,
      canGrantBreakGlassScopeFixture
    )
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: memberWithGranularScopesFixture._id,
        scopeId: canGrantBreakGlassScopeFixture.scopeId, // mimic string being passed via api endpoint
        teamId: tenantTeamFixture._id,
        startDate,
        endDate
      })
    ).rejects.toThrow(
      Boom.badRequest('Team member already has this scope assigned')
    )
  })

  test('Should throw error when startDate is set and endDate is "undefined"', async () => {
    const { startDate } = generateDates()

    await replaceOneTestHelper(
      collections.user,
      memberWithGranularScopesFixture
    )
    await replaceOneTestHelper(
      collections.scope,
      canGrantBreakGlassScopeFixture
    )
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: memberWithGranularScopesFixture._id,
        scopeId: canGrantBreakGlassScopeFixture.scopeId,
        teamId: tenantTeamFixture._id,
        startDate,
        endDate: undefined
      })
    ).rejects.toThrow(
      Boom.badRequest(
        'Start and End date must either both be set or both be empty'
      )
    )
  })

  test('Should throw error when date pair not provided', async () => {
    const { endDate } = generateDates()

    await replaceOneTestHelper(
      collections.user,
      memberWithGranularScopesFixture
    )
    await replaceOneTestHelper(
      collections.scope,
      canGrantBreakGlassScopeFixture
    )
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

    await expect(
      addScopeToMember({
        request,
        userId: memberWithGranularScopesFixture._id,
        scopeId: canGrantBreakGlassScopeFixture.scopeId,
        teamId: tenantTeamFixture._id,
        startDate: undefined,
        endDate
      })
    ).rejects.toThrow(
      Boom.badRequest(
        'Start and End date must either both be set or both be empty'
      )
    )
  })
})
