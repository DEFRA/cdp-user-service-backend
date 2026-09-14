import { subDays } from 'date-fns'
import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { disableInactiveUsers } from './disable-inactive-users.js'
import {
  addUserToTeam,
  createRelationshipIndexes,
  grantPermissionToTeam
} from '../../permissions/helpers/relationships/relationships.js'
import { scopeDefinitions } from '#config/scopes.js'

describe('#disableInactiveUsers', () => {
  let db

  beforeAll(async () => {
    const mongo = await connectToTestMongoDB()
    db = mongo.db
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany({})
    await db.collection('relationships').deleteMany({})
    await createRelationshipIndexes(db)
  })

  test('should skip stale users that are admins via team membership', async () => {
    const oldDate = subDays(new Date(), 90)

    await db.collection('users').insertMany([
      {
        _id: 'admin-user',
        name: 'Admin User',
        email: 'admin@example.test',
        createdAt: oldDate,
        updatedAt: oldDate,
        lastActive: oldDate
      },
      {
        _id: 'stale-user',
        name: 'Stale User',
        email: 'stale@example.test',
        createdAt: oldDate,
        updatedAt: oldDate,
        lastActive: oldDate
      }
    ])

    await addUserToTeam(db, 'admin-user', 'platform')
    await grantPermissionToTeam(db, 'platform', scopeDefinitions.admin.scopeId)

    const disabledUsers = await disableInactiveUsers(db, 60)

    expect(disabledUsers.map((user) => user._id)).toEqual(['stale-user'])

    const adminUser = await db
      .collection('users')
      .findOne({ _id: 'admin-user' })
    const staleUser = await db
      .collection('users')
      .findOne({ _id: 'stale-user' })

    expect(adminUser.disabled).toBeUndefined()
    expect(staleUser.disabled).toBe(true)
    expect(staleUser.disabledReason).toBe('inactivity')
  })
})
