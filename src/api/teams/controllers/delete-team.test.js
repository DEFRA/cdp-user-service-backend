import { config } from '~/src/config/index.js'
import { createServer } from '~/src/api/server.js'
import { Client } from '@microsoft/microsoft-graph-client'

jest.mock('@microsoft/microsoft-graph-client')
jest.mock('@azure/identity')

describe('/teams/{teamId}', () => {
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

    // Initialize sever
    server = await createServer()
    await server.initialize()
  })

  beforeEach(async () => {})

  afterEach(async () => {
    // Clear down collections
    await server.db.collection('users').deleteMany({})
    await server.db.collection('teams').deleteMany({})
  })

  afterAll(async () => {
    // Shutdown mongo client and server
    await server.mongoClient.close()
    await server.stop({ timeout: 0 })
  })

  async function invokeDeleteTeam(url) {
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

  test('Should error when team does not exist in the db', async () => {
    const teamId = crypto.randomUUID()
    const result = await invokeDeleteTeam(`/teams/${teamId}`)
    expect(result).toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  })

  describe('When a team does not have any users', () => {
    test('Should delete a team from DB', async () => {
      const teamId = crypto.randomUUID()
      const mockTeam = {
        _id: teamId,
        name: 'a-team',
        createdAt: new Date(),
        users: []
      }
      await server.db.collection('teams').insertOne(mockTeam)

      const result = await invokeDeleteTeam(`/teams/${teamId}`)

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })

      // TODO query the app endpoint to check if the team is deleted rather than querying the db directly
      // TODO Do we need to do this or is the above response enough?
      const teams = await server.db.collection('teams').find({}).toArray()
      expect(teams).toEqual([])
    })
  })

  describe('When a team has users', () => {
    test('Should remove user from AAD and team from user', async () => {
      // TODO can these abstracted?
      const userId = crypto.randomUUID()
      const teamId = crypto.randomUUID()
      const mockUser = {
        _id: userId,
        name: 'test',
        teams: [teamId],
        createdAt: new Date()
      }
      const mockTeam = {
        _id: teamId,
        name: 'a-team',
        createdAt: new Date(),
        users: [userId]
      }

      // TODO can these go in a beforeEach()?
      await server.db.collection('teams').insertOne(mockTeam)
      await server.db.collection('users').insertOne(mockUser)

      // TODO mockReturnValueOnce?
      mockMsGraph.get.mockReturnValue({
        value: [{ id: userId }]
      })
      // TODO mockResolvedValueOnce?
      mockMsGraph.delete.mockResolvedValue()

      const result = await invokeDeleteTeam(`/teams/${teamId}`)
      // Call to get members of a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${teamId}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)

      // Call to remove user from a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        2,
        `/groups/${teamId}/members/${userId}/$ref`
      )
      expect(mockMsGraph.delete).toHaveBeenCalledTimes(1)
      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
      // TODO use endpoint to check if team has been deleted rather than querying db directly?
      const teams = await server.db.collection('teams').find({}).toArray()
      const users = await server.db.collection('users').find({}).toArray()

      expect(teams).toEqual([])
      expect(users).toMatchObject([
        {
          _id: userId,
          name: 'test',
          teams: []
        }
      ])
    })
  })

  describe('When DB and AAD are out of sync', () => {
    test('Should complete DB user removal from team and DB user deletion', async () => {
      // TODO can these be helpers/abstracted?
      const userId = crypto.randomUUID()
      const teamId = crypto.randomUUID()
      const mockUser = {
        _id: userId,
        name: 'test',
        teams: [teamId],
        createdAt: new Date()
      }
      const mockTeam = {
        _id: teamId,
        name: 'a-team',
        createdAt: new Date(),
        users: [userId]
      }
      // TODO can these go in a beforeEach()?
      await server.db.collection('teams').insertOne(mockTeam)
      await server.db.collection('users').insertOne(mockUser)

      mockMsGraph.get.mockReturnValue({ value: [] })

      const result = await invokeDeleteTeam(`/teams/${teamId}`)

      // Call to get members of a group
      expect(mockMsGraph.api).toHaveBeenNthCalledWith(
        1,
        `/groups/${mockTeam._id}/members`
      )
      expect(mockMsGraph.get).toHaveBeenCalledTimes(1)

      // No call to remove user from a group
      expect(mockMsGraph.delete).not.toHaveBeenCalled()

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
      // TODO use endpoint to check if team has been deleted rather than querying db directly?
      const teams = await server.db.collection('teams').find({}).toArray()
      const users = await server.db.collection('users').find({}).toArray()

      expect(teams).toEqual([])
      expect(users).toMatchObject([
        {
          _id: userId,
          name: 'test',
          teams: []
        }
      ])
    })
  })
})
