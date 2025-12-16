import { addHours, subHours } from 'date-fns'

import { addScopeToMemberTransaction } from './add-scope-to-member-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { userTenantWithoutTeamFixture } from '../../../../__fixtures__/users.js'
import { teamWithoutUsers } from '../../../../__fixtures__/teams.js'
import { externalTestScopeFixture } from '../../../../__fixtures__/scopes.js'
import { collections } from '../../../../../test-helpers/constants.js'
import {
  deleteMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'

const request = {}
let deleteManyTestHelper, replaceOneTestHelper

describe('#addScopeToMemberTransaction', () => {
  beforeAll(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-09-12T08:45:00.000Z'))

    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

    replaceOneTestHelper = replaceOne(db)
    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([collections.scope, collections.user])
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('Should add scope to member', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    const startDate = new Date()
    const endDate = addHours(startDate, 2)

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName,
      teamId,
      teamName,
      startDate,
      endDate
    })

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([
      {
        scopeId,
        scopeName,
        teamId,
        teamName,
        startDate,
        endDate
      }
    ])

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.members).toEqual([
      {
        userId,
        userName,
        teamId,
        teamName,
        startDate,
        endDate
      }
    ])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    const startDate = new Date()
    const endDate = addHours(startDate, 2)

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
      addScopeToMemberTransaction({
        request,
        userId,
        userName,
        scopeId,
        scopeName,
        teamId,
        teamName,
        startDate,
        endDate
      })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.members).toEqual(externalTestScopeFixture.members)
  })

  test('Should remove old/stale scopes when new ones are added', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    const oldStartDate = subHours(new Date(), 4)
    const oldEndDate = addHours(oldStartDate, 2)

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // add old scope
    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName,
      teamId,
      teamName,
      startDate: oldStartDate,
      endDate: oldEndDate
    })

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([
      {
        scopeId,
        scopeName,
        teamId,
        teamName,
        startDate: oldStartDate,
        endDate: oldEndDate
      }
    ])

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.members).toEqual([
      {
        userId,
        userName,
        teamId,
        teamName,
        startDate: oldStartDate,
        endDate: oldEndDate
      }
    ])

    const startDate = new Date()
    const endDate = addHours(startDate, 2)
    // Add current scope
    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName,
      teamId,
      teamName,
      startDate,
      endDate
    })

    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual([
      {
        scopeId,
        scopeName,
        teamId,
        teamName,
        startDate,
        endDate
      }
    ])

    const updatedScope = await db
      .collection(collections.scope)
      .findOne({ scopeId })
    expect(updatedScope.members).toEqual([
      {
        userId,
        userName,
        teamId,
        teamName,
        startDate,
        endDate
      }
    ])
  })
})
