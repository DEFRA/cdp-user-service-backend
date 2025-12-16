import { addScopeToTeamTransaction } from './add-scope-to-team-transaction.js'
import { collections } from '../../../../../test-helpers/constants.js'
import { addUserToTeamTransaction } from '../team/add-user-to-team-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import {
  userTenantFixture,
  userTenantWithoutTeamFixture
} from '../../../../__fixtures__/users.js'
import {
  externalTestScopeFixture,
  postgresScopeFixture,
  testAsTenantScopeFixture
} from '../../../../__fixtures__/scopes.js'
import {
  deleteMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'
import {
  teamWithoutUsers,
  tenantTeamFixture
} from '../../../../__fixtures__/teams.js'

const request = {}
let deleteManyTestHelper, replaceOneTestHelper

describe('#addScopeToTeamTransaction', () => {
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

  test('Should add scope to team and team members', async () => {
    const { db } = request
    const userId = userTenantWithoutTeamFixture._id
    const { scopeId, value: scopeName } = testAsTenantScopeFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)
    await replaceOneTestHelper(collections.scope, testAsTenantScopeFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)

    await addUserToTeamTransaction(request, userId, teamId)
    await addScopeToTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId,
      scopeName
    })

    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.users).toEqual([userId])
    expect(team.scopes).toEqual([{ scopeId, scopeName }])

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual([{ scopeId, scopeName }])

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.teams).toEqual([{ teamId, teamName }])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const userId = userTenantFixture._id
    const { scopeId, value: scopeName } = externalTestScopeFixture
    const { _id: teamId, name: teamName } = tenantTeamFixture

    await replaceOneTestHelper(collections.user, userTenantFixture)
    await replaceOneTestHelper(collections.scope, externalTestScopeFixture)
    await replaceOneTestHelper(collections.team, tenantTeamFixture)

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
      addScopeToTeamTransaction({
        request,
        teamId,
        teamName,
        scopeId,
        scopeName
      })
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.scopes).toEqual(tenantTeamFixture.scopes)

    const user = await db.collection(collections.user).findOne({ _id: userId })
    expect(user.scopes).toEqual(userTenantFixture.scopes)

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.teams).toEqual(externalTestScopeFixture.teams)
  })

  test('Should add scopes to team, when team has no users', async () => {
    const { db } = request
    const { scopeId, value: scopeName } = postgresScopeFixture
    const { _id: teamId, name: teamName } = teamWithoutUsers

    await replaceOneTestHelper(collections.scope, postgresScopeFixture)
    await replaceOneTestHelper(collections.team, teamWithoutUsers)

    await addScopeToTeamTransaction({
      request,
      teamId,
      teamName,
      scopeId,
      scopeName
    })

    const team = await db.collection(collections.team).findOne({ _id: teamId })
    expect(team.scopes).toEqual([{ scopeId, scopeName }])

    const scope = await db.collection(collections.scope).findOne({ scopeId })
    expect(scope.teams).toEqual([
      ...postgresScopeFixture.teams,
      { teamId, teamName }
    ])
  })
})
