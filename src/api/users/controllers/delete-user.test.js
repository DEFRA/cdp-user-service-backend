import { config } from '~/src/config'
import { createServer } from '~/src/api/server'
import { Client } from '@microsoft/microsoft-graph-client'

jest.mock('@microsoft/microsoft-graph-client')
jest.mock('@azure/identity')

describe('/users/{userId}', () => {
  const mockUser = {
    _id: '2fdc6295-b3e5-409e-846a-2ec237f20977',
    name: 'Tetsuo Shima',
    email: 'tetsuo.shima@email.com',
    github: 'TetsuoShima',
    defraVpnId: '1234556789',
    defraAwsId: 'abcde-123456',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const mockUserInATeam = {
    _id: 'be675e78-a02a-433a-b7f5-a0786730a283',
    name: 'Akira',
    email: 'akira@email.com',
    github: 'Akira',
    defraVpnId: '546456456',
    defraAwsId: '45645-dfgddgd',
    teams: ['aea8bc8e-0dec-4fd7-a1f5-c69ead3f39ab'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const mockTeam = {
    _id: 'aea8bc8e-0dec-4fd7-a1f5-c69ead3f39ab',
    name: 'A-team',
    description: 'The A-team',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: ['be675e78-a02a-433a-b7f5-a0786730a283'],
    github: 'a-team'
  }
  let server
  let mockMsGraph

  beforeAll(async () => {
    // Mock MsGraph client
    mockMsGraph = {
      api: jest.fn().mockReturnThis(),
      get: jest.fn(),
      delete: jest.fn()
    }
    Client.initWithMiddleware = () => mockMsGraph

    server = await createServer()
    await server.initialize()
  })

  beforeEach(async () => {
    await server.db.collection('users').insertMany([mockUser, mockUserInATeam])
    await server.db.collection('teams').insertOne(mockTeam)
  })

  afterEach(async () => {
    await server.db.collection('users').drop()
    await server.db.collection('teams').drop()
  })

  afterAll(async () => {
    await server.mongoClient.close()
    await server.stop({ timeout: 0 })
  })

  async function invokeDeleteUser(url) {
    return await server.inject({
      method: 'DELETE',
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [config.get('oidcAdminGroupId')]
        }
      }
    })
  }

  test('Should error when non uuid passed as userId param', async () => {
    const result = await invokeDeleteUser('/users/not-a-uuid')
    expect(result).toMatchObject({
      statusCode: 400,
      statusMessage: 'Bad Request'
    })
  })

  test('Should error when user uuid does not exist in the db', async () => {
    const result = await invokeDeleteUser(
      '/users/8469dcf7-846d-43fd-899a-9850bc43298b'
    )
    expect(result).toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  })

  describe('When a user is not in any teams', () => {
    test('Should delete a user from DB', async () => {
      const result = await invokeDeleteUser(`/users/${mockUser._id}`)

      const users = await server.db.collection('users').find({}).toArray()

      expect(users).toEqual([mockUserInATeam])

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
    })
  })

  describe('When a user is in a team', () => {
    test('Should remove user from the AAD team and delete the user from DB', async () => {
      mockMsGraph.get.mockReturnValue({
        value: [{ id: mockUserInATeam._id }]
      })
      mockMsGraph.delete.mockResolvedValue()

      const result = await invokeDeleteUser(`/users/${mockUserInATeam._id}`)

      // Call to get members of a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${mockTeam._id}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)

      // Call to remove user from a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        2,
        `/groups/${mockTeam._id}/members/${mockUserInATeam._id}/$ref`
      )
      expect(mockMsGraph.delete).toHaveBeenCalledTimes(1)

      const users = await server.db.collection('users').find({}).toArray()
      const teams = await server.db.collection('teams').find({}).toArray()

      expect(users).toEqual([mockUser])
      expect(teams).toMatchObject([
        {
          _id: mockTeam._id,
          name: 'A-team',
          users: []
        }
      ])

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
    })
  })

  describe('When DB and AAD are out of sync', () => {
    test('Should complete DB user removal from team and DB user deletion', async () => {
      mockMsGraph.get.mockReturnValue({ value: [] })

      const result = await invokeDeleteUser(`/users/${mockUserInATeam._id}`)

      // Call to get members of a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${mockTeam._id}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)

      // No call to remove user from a group
      expect(mockMsGraph.delete).not.toHaveBeenCalled()

      const users = await server.db.collection('users').find({}).toArray()
      const teams = await server.db.collection('teams').find({}).toArray()

      expect(users).toEqual([mockUser])
      expect(teams).toMatchObject([
        {
          _id: mockTeam._id,
          name: 'A-team',
          users: []
        }
      ])

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
    })
  })
})
