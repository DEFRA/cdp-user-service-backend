import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { updateLastActive } from './update-last-active.js'

describe('#updateLastActive', () => {
  const request = {}

  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
  })

  it('should not set the lastActive date if the user doesnt exist', async () => {
    await updateLastActive(request.db, 'missinguser')
    const result = await request.db
      .collection('users')
      .findOne({ _id: 'missinguser' })

    expect(result).toBeNull()
  })

  it('should set the lastActive date if is not already set', async () => {
    await request.db.collection('users').insertOne({
      _id: 'user1',
      createdAt: new Date('2024-11-11T13:51:00.028Z'),
      email: 'non-admin.user@oidc.mock',
      github: 'nonadminuser',
      name: 'Non-Admin User',
      updatedAt: new Date('2024-11-12T13:24:00.028Z')
    })

    await updateLastActive(request.db, 'user1')

    const firstUpdate = await request.db
      .collection('users')
      .findOne({ _id: 'user1' })

    expect(firstUpdate.lastActive).toBeDefined()

    await updateLastActive(request.db, 'user1')
    const secondUpdate = await request.db
      .collection('users')
      .findOne({ _id: 'user1' })

    expect(firstUpdate.lastActive).toBeDefined()
    expect(secondUpdate.lastActive).toBeDefined()
    expect(firstUpdate.lastActive.getTime()).toBeLessThan(
      secondUpdate.lastActive.getTime()
    )
  })
})
