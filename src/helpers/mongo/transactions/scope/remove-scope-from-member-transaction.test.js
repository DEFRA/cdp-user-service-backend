import { addHours, subHours } from 'date-fns'

import { removeScopeFromMemberTransaction } from './remove-scope-from-member-transaction.js'
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

describe('#removeScopeFromMemberTransaction', () => {
  beforeAll(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-09-10T14:19:00.000Z'))

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

  afterAll(() => {
    vi.useRealTimers()
  })

  test('Should remove currently active team based scope from a member', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    const startDate = subHours(new Date(), 1)
    const endDate = addHours(startDate, 2)

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // First add the scope to the member
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

    // Check scope has been added correctly
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

    // Now remove scope from member
    await removeScopeFromMemberTransaction({
      request,
      userId,
      scopeId,
      teamId
    })

    // Check scope has been removed correctly
    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    const updatedScope = await db
      .collection(collections.scope)
      .findOne({ scopeId })
    expect(updatedScope.members).toEqual(externalTestScopeFixture.members)
  })

  test('Should remove team based scope from a member', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // First add the scope to the member
    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName,
      teamId,
      teamName
    })

    // Check scope has been added correctly
    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([
      {
        scopeId,
        scopeName,
        teamId,
        teamName
      }
    ])

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.members).toEqual([
      {
        userId,
        userName,
        teamId,
        teamName
      }
    ])

    // Now remove scope from member
    await removeScopeFromMemberTransaction({
      request,
      userId,
      scopeId,
      teamId
    })

    // Check scope has been removed correctly
    const updatedUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(updatedUser.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    const updatedScope = await db
      .collection(collections.scope)
      .findOne({ scopeId })
    expect(updatedScope.members).toEqual(externalTestScopeFixture.members)
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: userId, name: userName } = userTenantWithoutTeamFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    // Pre-transaction expectations. These are checked before and after a failed transaction to ensure no changes were made
    const preTransactionUserScopes = [
      {
        scopeId,
        scopeName,
        teamId,
        teamName
      }
    ]
    const preTransactionScopeMembers = [
      {
        userId,
        userName,
        teamId,
        teamName
      }
    ]

    // First add the scope to the member
    await addScopeToMemberTransaction({
      request,
      userId,
      userName,
      scopeId,
      scopeName,
      teamId,
      teamName
    })

    // Check scope has been added correctly
    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(preTransactionUserScopes)

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.members).toEqual(preTransactionScopeMembers)

    // Now throw an error when removing scope from the member
    const originalCollection = db.collection.bind(db)
    const collectionSpy = vi.spyOn(db, 'collection')

    collectionSpy
      .mockImplementationOnce((name) => originalCollection(name))
      .mockImplementationOnce(() => {
        // Force an error within the transaction
        throw new Error('Force rollback')
      })

    await expect(
      removeScopeFromMemberTransaction({
        request,
        userId,
        scopeId,
        teamId
      })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    // Check the scope remains unchanged
    const rolledBackUser = await db
      .collection(collections.user)
      .findOne({ _id: userId })
    expect(rolledBackUser.scopes).toEqual(preTransactionUserScopes)

    const rolledBackScope = await db
      .collection(collections.scope)
      .findOne({ scopeId })
    expect(rolledBackScope.members).toEqual(preTransactionScopeMembers)
  })
})
