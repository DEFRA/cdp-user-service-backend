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

  const callDeleteUser = async (url) =>
    await server.inject({
      method: 'DELETE',
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [config.get('oidcAdminGroupId')]
        }
      }
    })

  test('Should error when non uuid passed as userId param', async () => {
    const result = await callDeleteUser('/users/not-a-uuid')

    expect(result.statusMessage).toEqual('Bad Request')
    expect(result.statusCode).toEqual(400)
  })

  test('Should error when user uuid does not exist in the db', async () => {
    const result = await callDeleteUser(
      '/users/8469dcf7-846d-43fd-899a-9850bc43298b'
    )

    expect(server.logger.error).toHaveBeenCalledWith(
      { error: Error('User not found') },
      'User deletion aborted due to: User not found'
    )
    expect(result.statusMessage).toEqual('Not Found')
    expect(result.statusCode).toEqual(404)
  })

  describe('When a user is not in any teams', () => {
    test('Should delete a user from DB', async () => {
      const result = await callDeleteUser(`/users/${mockUser._id}`)

      expect(server.logger.info).toHaveBeenCalledWith('User deleted from CDP')
      expect(result.statusMessage).toEqual('OK')
      expect(result.statusCode).toEqual(200)
    })
  })

  describe('When a user is in a team', () => {
    test('Should remove user from the AAD team and delete the user from DB', async () => {
      mockMsGraph.get.mockReturnValue({
        value: [{ id: mockUserInATeam._id }]
      })
      mockMsGraph.delete.mockResolvedValue()

      const result = await callDeleteUser(`/users/${mockUserInATeam._id}`)

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
      expect(server.logger.info).toHaveBeenNthCalledWith(
        1,
        `User: ${mockUserInATeam._id} removed from AAD teamId: ${mockTeam._id}`
      )

      // User removed from the DB
      expect(server.logger.info).toHaveBeenNthCalledWith(
        2,
        `User removed from CDP ${mockTeam.name} team`
      )
      expect(server.logger.info).toHaveBeenNthCalledWith(
        3,
        'User deleted from CDP'
      )

      expect(result.statusMessage).toEqual('OK')
      expect(result.statusCode).toEqual(200)
    })
  })

  describe('When DB and AAD are out of sync', () => {
    test('Should complete DB user removal from team and DB user deletion', async () => {
      mockMsGraph.get.mockReturnValue({ value: [] })

      const result = await callDeleteUser(`/users/${mockUserInATeam._id}`)

      // Call to get members of a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${mockTeam._id}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)

      // No call to remove user from a group
      expect(mockMsGraph.delete).not.toHaveBeenCalled()

      // User removed from the DB
      expect(server.logger.info).toHaveBeenNthCalledWith(
        1,
        `User removed from CDP ${mockTeam.name} team`
      )
      expect(server.logger.info).toHaveBeenNthCalledWith(
        2,
        'User deleted from CDP'
      )

      expect(result.statusMessage).toEqual('OK')
      expect(result.statusCode).toEqual(200)
    })
  })
})
