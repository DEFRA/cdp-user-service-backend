import { addUserToTeamTransaction } from './add-user-to-team-transaction.js'
import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import { collections } from '../../../../../test-helpers/constants.js'
import {
  userAdminFixture,
  userAdminOtherFixture,
  userTenantFixture,
  userTenantWithoutTeamFixture
} from '../../../../__fixtures__/users.js'
import {
  platformTeamFixture,
  teamWithoutUsers,
  tenantTeamFixture
} from '../../../../__fixtures__/teams.js'
import {
  adminScopeFixture,
  externalTestScopeFixture,
  postgresScopeFixture
} from '../../../../__fixtures__/scopes.js'
import {
  deleteMany,
  replaceMany,
  replaceOne
} from '../../../../../test-helpers/mongo-helpers.js'

const request = {}
let replaceManyTestHelper, deleteManyTestHelper, replaceOneTestHelper

describe('#addUserToTeamTransaction', () => {
  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

    replaceOneTestHelper = replaceOne(db)
    replaceManyTestHelper = replaceMany(db)
    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([
      collections.team,
      collections.scope,
      collections.user
    ])
  })

  test('Should add user to team and user should be given team scopes', async () => {
    const { db } = request
    const teamId = platformTeamFixture._id
    const userId = userTenantWithoutTeamFixture._id

    await replaceOneTestHelper(collections.team, platformTeamFixture)
    await replaceManyTestHelper(collections.scope, [
      adminScopeFixture,
      externalTestScopeFixture
    ])
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    await addUserToTeamTransaction(request, userId, teamId)

    const user = await db.collection(collections.user).findOne({ _id: userId })
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(user.teams).toEqual([teamId])
    expect(user.scopes).toEqual([
      {
        scopeId: externalTestScopeFixture._id,
        scopeName: externalTestScopeFixture.value
      },
      {
        scopeId: adminScopeFixture._id,
        scopeName: adminScopeFixture.value
      }
    ])

    expect(team.users).toEqual([userAdminFixture._id, userId])
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const teamId = teamWithoutUsers._id
    const userId = userTenantWithoutTeamFixture._id

    await replaceOneTestHelper(collections.team, teamWithoutUsers)
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
      addUserToTeamTransaction(request, userId, teamId)
    ).rejects.toThrow(/Force rollback/)

    collectionSpy.mockRestore()

    const user = await db.collection(collections.user).findOne({ _id: userId })
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(user.teams).toEqual(userTenantWithoutTeamFixture.teams)
    expect(user.scopes).toEqual(userTenantWithoutTeamFixture.scopes)

    expect(team.users).toEqual(teamWithoutUsers.users)
  })

  test('Should be idempotent for the same user and team pair', async () => {
    const { db } = request
    const teamId = tenantTeamFixture._id
    const userId = userTenantWithoutTeamFixture._id

    await replaceOneTestHelper(collections.team, tenantTeamFixture)
    await replaceOneTestHelper(collections.scope, postgresScopeFixture)
    await replaceOneTestHelper(collections.user, userTenantWithoutTeamFixture)

    await addUserToTeamTransaction(request, userId, teamId)
    await addUserToTeamTransaction(request, userId, teamId) // run again

    const user = await db.collection(collections.user).findOne({ _id: userId })
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(user.teams).toEqual([teamId])
    expect(user.scopes).toEqual([
      {
        scopeId: postgresScopeFixture._id,
        scopeName: postgresScopeFixture.value
      }
    ])

    expect(team.users).toEqual([userTenantFixture._id, userId])
  })

  test('Should add team membership when team has no scopes', async () => {
    const { db } = request
    const teamId = teamWithoutUsers._id
    const userId = userAdminOtherFixture._id

    await replaceOneTestHelper(collections.team, teamWithoutUsers)
    await replaceOneTestHelper(collections.user, userAdminOtherFixture)

    await addUserToTeamTransaction(request, userId, teamId)

    const user = await db.collection(collections.user).findOne({ _id: userId })
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(user.teams).toEqual([platformTeamFixture._id, teamId])
    expect(user.scopes).toEqual([])

    expect(team.users).toEqual([userId])
  })
})
