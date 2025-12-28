import { connectToTestMongoDB } from '../../../../../test-helpers/connect-to-test-mongodb.js'
import {
  addUserToTeam,
  removeUserFromTeam,
  createIndexes,
  findMembersOfTeam,
  grantPermissionToTeam,
  revokePermissionFromTeam,
  findTeamsOfUser,
  grantPermissionToUser,
  revokePermissionFromUser,
  deleteTeamRelationships,
  deleteUserRelationships
} from './relationships.js'

describe('#relationships', () => {
  const request = {}

  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
  })

  beforeEach(async () => {
    await request.db.collection('relationships').drop()
    await createIndexes(request.db)
  })

  test('#addUserToTeam creates a member relationship', async () => {
    const resultBeforeAddingUser = await findMembersOfTeam(
      request.db,
      'platform'
    )
    expect(resultBeforeAddingUser.length).toBe(0)

    await addUserToTeam(request.db, 'jim', 'platform')

    const membersOfTeam = await findMembersOfTeam(request.db, 'platform')
    expect(membersOfTeam.length).toBe(1)
    expect(membersOfTeam.sort()).toEqual(['jim'])

    const teamsOfUser = await findTeamsOfUser(request.db, 'jim')
    expect(teamsOfUser.length).toBe(1)
    expect(teamsOfUser).toEqual(['platform'])
  })

  test('#addUserToTeam doesnt create duplicates', async () => {
    const resultBeforeAddingUser = await findMembersOfTeam(
      request.db,
      'platform'
    )
    expect(resultBeforeAddingUser.length).toBe(0)

    await addUserToTeam(request.db, 'jim', 'platform')
    await addUserToTeam(request.db, 'jim', 'platform')

    const result = await findMembersOfTeam(request.db, 'platform')
    expect(result.length).toBe(1)
    expect(result.sort()).toEqual(['jim'])
  })

  test('#removeUserFromTeam', async () => {
    await addUserToTeam(request.db, 'jim', 'platform')
    const resultBeforeRemoval = await findMembersOfTeam(request.db, 'platform')
    expect(resultBeforeRemoval.length).toBe(1)

    await removeUserFromTeam(request.db, 'jim', 'platform')
    const result = await findMembersOfTeam(request.db, 'platform')
    expect(result).toEqual([])
  })

  test('#grantPermissionToTeam should grant a permission to a team', async () => {
    await grantPermissionToTeam(request.db, 'team1', 'admin')

    const result = await request.db
      .collection('relationships')
      .find({ subject: 'team1' })
      .project({ _id: 0 })
      .toArray()
    expect(result).toEqual([
      {
        subject: 'team1',
        subjectType: 'team',
        relation: 'granted',
        resource: 'admin',
        resourceType: 'permission'
      }
    ])
  })

  test('#revoketPermissionFromTeam should remove a permission to a team', async () => {
    await grantPermissionToTeam(request.db, 'team1', 'admin')
    await grantPermissionToTeam(request.db, 'team1', 'externalTest')

    await revokePermissionFromTeam(request.db, 'team1', 'externalTest')

    const result = await request.db
      .collection('relationships')
      .find({ subject: 'team1' })
      .project({ _id: 0 })
      .toArray()
    expect(result).toEqual([
      {
        subject: 'team1',
        subjectType: 'team',
        relation: 'granted',
        resource: 'admin',
        resourceType: 'permission'
      }
    ])
  })

  test('#revokePermissionFromUser should remove a permission to a user', async () => {
    await grantPermissionToUser(request.db, 'jim', 'admin')
    await grantPermissionToUser(request.db, 'jim', 'externalTest')
    await revokePermissionFromUser(request.db, 'jim', 'externalTest')

    const result = await request.db
      .collection('relationships')
      .find({ subject: 'jim' })
      .project({ _id: 0 })
      .toArray()
    expect(result).toEqual([
      {
        subject: 'jim',
        subjectType: 'user',
        relation: 'granted',
        resource: 'admin',
        resourceType: 'permission'
      }
    ])
  })

  test('#deleteTeamRelationships should remove all permissions and users from the team', async () => {
    await grantPermissionToTeam(request.db, 'team2', 'admin')
    await grantPermissionToTeam(request.db, 'team2', 'externalTest')
    await addUserToTeam(request.db, 'bob', 'team2')
    await addUserToTeam(request.db, 'tony', 'team2')

    const membersBefore = await findMembersOfTeam(request.db, 'team2')
    const teamOfBobBefore = await findTeamsOfUser(request.db, 'bob')
    const teamOfTonyBefore = await findTeamsOfUser(request.db, 'tony')
    const permissionOfTeamBefore = await request.db
      .collection('relationships')
      .find({ subject: 'team2', relation: 'granted' })
      .project({ _id: 0, resource: 1 })
      .toArray()

    expect(membersBefore).toEqual(['bob', 'tony'])
    expect(teamOfBobBefore).toEqual(['team2'])
    expect(teamOfTonyBefore).toEqual(['team2'])
    expect(permissionOfTeamBefore.map((p) => p.resource)).toEqual([
      'admin',
      'externalTest'
    ])

    await deleteTeamRelationships(request.db, 'team2')

    const membersAfter = await findMembersOfTeam(request.db, 'team2')
    const teamOfBobAfter = await findTeamsOfUser(request.db, 'bob')
    const teamOfTonyAfter = await findTeamsOfUser(request.db, 'tony')
    const permissionOfTeamAfter = await request.db
      .collection('relationships')
      .find({ subject: 'team2', relation: 'granted' })
      .project({ _id: 0, resource: 1 })
      .toArray()

    expect(membersAfter).toEqual([])
    expect(teamOfBobAfter).toEqual([])
    expect(teamOfTonyAfter).toEqual([])
    expect(permissionOfTeamAfter.map((p) => p.resource)).toEqual([])
  })

  test('#deleteUserRelationships should remove all permissions and team members for that user', async () => {
    await grantPermissionToUser(request.db, 'user1', 'admin')
    await grantPermissionToUser(request.db, 'user1', 'externalTest')
    await addUserToTeam(request.db, 'user1', 'team3')
    await addUserToTeam(request.db, 'user2', 'team3')

    const membersBefore = await findMembersOfTeam(request.db, 'team3')
    const teamsBefore = await findTeamsOfUser(request.db, 'user1')

    const permissionOfUserBefore = await request.db
      .collection('relationships')
      .find({ subject: 'user1', relation: 'granted' })
      .project({ _id: 0, resource: 1 })
      .toArray()

    expect(membersBefore).toEqual(['user1', 'user2'])
    expect(teamsBefore).toEqual(['team3'])
    expect(permissionOfUserBefore.map((p) => p.resource)).toEqual([
      'admin',
      'externalTest'
    ])

    await deleteUserRelationships(request.db, 'user1')

    const membersAfter = await findMembersOfTeam(request.db, 'team3')
    const teamsAfter = await findTeamsOfUser(request.db, 'user1')
    const permissionOfUserAfter = await request.db
      .collection('relationships')
      .find({ subject: 'user1', relation: 'granted' })
      .project({ _id: 0, resource: 1 })
      .toArray()

    expect(membersAfter).toEqual([])
    expect(teamsAfter).toEqual([])
    expect(permissionOfUserAfter.map((p) => p.resource)).toEqual([])
  })
})
