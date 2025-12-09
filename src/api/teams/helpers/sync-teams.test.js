import { connectToTestMongoDB } from '../../../../test-helpers/connect-to-test-mongodb.js'
import { syncTeams } from './sync-teams.js'

describe('#syncTeams', () => {
  const request = {}

  beforeAll(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-09-12T08:45:00.000Z'))

    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
  })

  beforeEach(async () => {
    await request.db.collection('teams').drop()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('It populates from empty', async () => {
    let current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(0)

    await syncTeams(request.db, [
      {
        teamId: 'team1',
        name: 'Team1',
        description: 'A Team',
        github: 'ghaccount',
        serviceCode: 'TST'
      },
      {
        teamId: 'team2',
        name: 'Team2',
        description: 'Another Team',
        serviceCode: 'ANN'
      }
    ])

    current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(2)
  })

  test('It doesnt overwrite existing fields', async () => {
    await request.db.collection('teams').insertOne({
      _id: 'check-for-flooding',
      name: 'Check-For-Flooding',
      description: 'This team should be updated.',
      github: 'ghteam',
      serviceCodes: ['CFF'],
      createdAt: new Date('2025-08-19T15:26:17.526Z'),
      updatedAt: new Date('2025-10-15T15:48:06.935Z'),
      users: [
        '2a0fd147-0000-410d-922d-69f93d6abf73',
        '351ef4d1-0000-4d69-90af-de18c2fc70de'
      ],
      scopes: ['foo']
    })

    let current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(1)

    await syncTeams(request.db, [
      {
        teamId: 'check-for-flooding',
        name: 'Check-For-Flooding',
        description: 'Updated Value',
        github: 'ghaccount'
      }
    ])

    current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(1)
    expect(current[0]).toMatchObject({
      _id: 'check-for-flooding',
      name: 'Check-For-Flooding',
      description: 'Updated Value',
      github: 'ghaccount',
      serviceCodes: ['CFF'],
      createdAt: new Date('2025-08-19T15:26:17.526Z'),
      updatedAt: new Date('2025-10-15T15:48:06.935Z'),
      users: [
        '2a0fd147-0000-410d-922d-69f93d6abf73',
        '351ef4d1-0000-4d69-90af-de18c2fc70de'
      ],
      scopes: ['foo']
    })
  })

  test('It populates, updates and deletes', async () => {
    let current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(0)

    // set the initial teams
    await syncTeams(request.db, [
      {
        teamId: 'team1',
        name: 'Team1',
        description: 'A Team',
        github: 'ghaccount',
        serviceCode: 'TST'
      },
      {
        teamId: 'team2',
        name: 'Team2',
        description: 'Another Team',
        serviceCode: 'ANN'
      }
    ])

    current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(2)

    // Update one of the teams
    await syncTeams(request.db, [
      {
        teamId: 'team1',
        name: 'Team1',
        description: 'A Team',
        github: 'foobar',
        serviceCode: 'TST'
      },
      {
        teamId: 'team2',
        name: 'Team2',
        description: 'Another Team',
        serviceCode: 'ANN'
      }
    ])

    current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(2)
    expect(current[0].github).toEqual('foobar')

    // delete
    // Update one of the teams
    await syncTeams(request.db, [
      {
        teamId: 'team1',
        name: 'Team1',
        description: 'A Team',
        github: 'foobar',
        serviceCode: 'TST'
      }
    ])

    current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(1)
    expect(current[0]._id).toEqual('team1')
  })

  test('It refuses to process an empty array of teams', async () => {
    await request.db.collection('teams').insertOne({
      _id: 'check-for-flooding',
      name: 'Check-For-Flooding',
      description: 'This team should be updated.',
      github: 'ghteam',
      serviceCodes: ['CFF'],
      createdAt: new Date('2025-08-19T15:26:17.526Z'),
      updatedAt: new Date('2025-10-15T15:48:06.935Z'),
      users: [
        '2a0fd147-0000-410d-922d-69f93d6abf73',
        '351ef4d1-0000-4d69-90af-de18c2fc70de'
      ],
      scopes: ['foo']
    })

    let current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(1)

    await syncTeams(request.db, [])
    current = await request.db.collection('teams').find({}).toArray()
    expect(current.length).toBe(1)
  })
})
