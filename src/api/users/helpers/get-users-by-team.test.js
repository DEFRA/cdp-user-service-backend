import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { createTeam } from '../../teams/helpers/create-team.js'
import { createUser } from './create-user.js'
import { addUserToTeam } from '../../permissions/helpers/relationships/relationships.js'
import { getUsersByTeam } from './get-users-by-team.js'

describe('#get-user-by-teams', () => {
  const request = {}

  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
  })

  beforeAll(async () => {
    await createTeam(request.db, { name: 'foo', description: 'foo team' })
    await createTeam(request.db, { name: 'bar', description: 'bar team' })
    await createUser(request.db, {
      _id: '1111',
      name: 'user1',
      email: 'user1@email.com'
    })
    await createUser(request.db, {
      _id: '2222',
      name: 'user2',
      email: 'user2@email.com'
    })

    await createUser(request.db, {
      _id: '3333',
      name: 'user3',
      email: 'user3@email.com'
    })

    await addUserToTeam(request.db, '1111', 'foo')
    await addUserToTeam(request.db, '2222', 'foo')
    await addUserToTeam(request.db, '2222', 'bar')
    await addUserToTeam(request.db, '3333', 'bar')
  })
  afterEach(async () => {
    await request.db.collection('users').drop()
    await request.db.collection('teams').drop()
    await request.db.collection('relationships').drop()
  })

  test('should return only users in team', async () => {
    const resultTeam1 = await getUsersByTeam(request.db, 'foo')
    expect(resultTeam1.map((u) => u.userId)).toEqual(['1111', '2222'])

    const resultTeam2 = await getUsersByTeam(request.db, 'bar')
    expect(resultTeam2.map((u) => u.userId)).toEqual(['2222', '3333'])

    const resultTeam3 = await getUsersByTeam(request.db, 'baz')
    expect(resultTeam3.map((u) => u.userId)).toEqual([])
  })
})
