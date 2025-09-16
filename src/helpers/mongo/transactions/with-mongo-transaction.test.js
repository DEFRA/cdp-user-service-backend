import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { withMongoTransaction } from './with-mongo-transaction.js'
import { userTenantWithoutTeamFixture } from '../../../__fixtures__/users.js'
import { teamWithoutUsers } from '../../../__fixtures__/teams.js'
import { deleteMany } from '../../../../test-helpers/mongo-helpers.js'
import { collections } from '../../../../test-helpers/constants.js'

const request = {}
let deleteManyTestHelper

describe('#withMongoTransaction', () => {
  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient

    deleteManyTestHelper = deleteMany(db)
  })

  beforeEach(async () => {
    await deleteManyTestHelper([
      collections.team,
      collections.scope,
      collections.user
    ])
  })

  test('Should complete transaction', async () => {
    const { db } = request
    const teamId = teamWithoutUsers._id
    const userId = userTenantWithoutTeamFixture._id

    await withMongoTransaction(request)(async ({ db, session }) => {
      await db
        .collection(collections.team)
        .insertOne(teamWithoutUsers, { session })
      await db
        .collection(collections.user)
        .insertOne(userTenantWithoutTeamFixture, { session })
    })

    const user = await db.collection(collections.user).findOne({ _id: userId })
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(user).toEqual(userTenantWithoutTeamFixture)
    expect(team).toEqual(teamWithoutUsers)

    const users = await db.collection(collections.user).find({}).toArray()
    const teams = await db.collection(collections.team).find({}).toArray()

    expect(users).toHaveLength(1)
    expect(teams).toHaveLength(1)
  })

  test('Should rollback when a write fails within transaction', async () => {
    const { db } = request
    const teamId = teamWithoutUsers._id
    const userId = userTenantWithoutTeamFixture._id

    await expect(
      withMongoTransaction(request)(async ({ db, session }) => {
        await db
          .collection(collections.team)
          .insertOne(teamWithoutUsers, { session })
        await db
          .collection(collections.user)
          .insertOne(userTenantWithoutTeamFixture, { session })

        // Force an error within the transaction
        throw new Error('Force rollback')
      })
    ).rejects.toThrow(/Force rollback/)

    const user = await db.collection(collections.user).findOne({ _id: userId })
    const team = await db.collection(collections.team).findOne({ _id: teamId })

    expect(user).toBeNull()
    expect(team).toBeNull()

    const users = await db.collection(collections.user).find({}).toArray()
    const teams = await db.collection(collections.team).find({}).toArray()

    expect(users).toHaveLength(0)
    expect(teams).toHaveLength(0)
  })
})
