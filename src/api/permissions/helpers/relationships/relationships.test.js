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
  deleteUserRelationships,
  userIsMemberOfTeam,
  grantTeamScopedPermissionToUser,
  revokeTeamScopedPermissionFromUser,
  findActiveBreakGlassForUser
} from './relationships.js'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { subHours, addHours } from 'date-fns'

describe('#relationships', () => {
  let db = null

  beforeAll(async () => {
    const mongo = await connectToTestMongoDB()
    db = mongo.db
  })

  beforeEach(async () => {
    await db.collection('relationships').drop()
    await createIndexes(db)
  })

  test('#addUserToTeam creates a member relationship', async () => {
    const resultBeforeAddingUser = await findMembersOfTeam(db, 'platform')
    expect(resultBeforeAddingUser.length).toBe(0)

    await addUserToTeam(db, 'jim', 'platform')

    const membersOfTeam = await findMembersOfTeam(db, 'platform')
    expect(membersOfTeam.length).toBe(1)
    expect(membersOfTeam.sort()).toEqual(['jim'])

    const teamsOfUser = await findTeamsOfUser(db, 'jim')
    expect(teamsOfUser.length).toBe(1)
    expect(teamsOfUser).toEqual(['platform'])
  })

  test('#addUserToTeam doesnt create duplicates', async () => {
    const resultBeforeAddingUser = await findMembersOfTeam(db, 'platform')
    expect(resultBeforeAddingUser.length).toBe(0)

    await addUserToTeam(db, 'jim', 'platform')
    await addUserToTeam(db, 'jim', 'platform')

    const result = await findMembersOfTeam(db, 'platform')
    expect(result.length).toBe(1)
    expect(result.sort()).toEqual(['jim'])
  })

  test('#removeUserFromTeam', async () => {
    await addUserToTeam(db, 'jim', 'platform')
    const resultBeforeRemoval = await findMembersOfTeam(db, 'platform')
    expect(resultBeforeRemoval.length).toBe(1)

    await removeUserFromTeam(db, 'jim', 'platform')
    const result = await findMembersOfTeam(db, 'platform')
    expect(result).toEqual([])
  })

  test('#grantPermissionToTeam should grant a permission to a team', async () => {
    await grantPermissionToTeam(db, 'team1', 'admin')

    const result = await db
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
    await grantPermissionToTeam(db, 'team1', 'admin')
    await grantPermissionToTeam(db, 'team1', 'externalTest')

    await revokePermissionFromTeam(db, 'team1', 'externalTest')

    const result = await db
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
    await grantPermissionToUser(db, 'jim', 'admin')
    await grantPermissionToUser(db, 'jim', 'externalTest')
    await revokePermissionFromUser(db, 'jim', 'externalTest')

    const result = await db
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
    await grantPermissionToTeam(db, 'team2', 'admin')
    await grantPermissionToTeam(db, 'team2', 'externalTest')
    await addUserToTeam(db, 'bob', 'team2')
    await addUserToTeam(db, 'tony', 'team2')

    const membersBefore = await findMembersOfTeam(db, 'team2')
    const teamOfBobBefore = await findTeamsOfUser(db, 'bob')
    const teamOfTonyBefore = await findTeamsOfUser(db, 'tony')
    const permissionOfTeamBefore = await db
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

    await deleteTeamRelationships(db, 'team2')

    const membersAfter = await findMembersOfTeam(db, 'team2')
    const teamOfBobAfter = await findTeamsOfUser(db, 'bob')
    const teamOfTonyAfter = await findTeamsOfUser(db, 'tony')
    const permissionOfTeamAfter = await db
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
    await grantPermissionToUser(db, 'user1', 'admin')
    await grantPermissionToUser(db, 'user1', 'externalTest')
    await addUserToTeam(db, 'user1', 'team3')
    await addUserToTeam(db, 'user2', 'team3')
    await grantTeamScopedPermissionToUser(
      db,
      'user1',
      'team1',
      scopeDefinitions.breakGlass.scopeId,
      new Date(),
      new Date()
    )

    const membersBefore = await findMembersOfTeam(db, 'team3')
    const teamsBefore = await findTeamsOfUser(db, 'user1')

    const permissionOfUserBefore = await db
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

    await deleteUserRelationships(db, 'user1')

    const membersAfter = await findMembersOfTeam(db, 'team3')
    const teamsAfter = await findTeamsOfUser(db, 'user1')
    const anyRelationsOfUserAfter = await db
      .collection('relationships')
      .find({ subject: 'user1' })
      .project({ _id: 0, resource: 1 })
      .toArray()

    expect(membersAfter).toEqual(['user2'])
    expect(teamsAfter).toEqual([])
    expect(anyRelationsOfUserAfter).toEqual([])
  })

  test('#userIsMemberOfTeam should return true if user is member', async () => {
    await addUserToTeam(db, 'user1', 'team1')
    await addUserToTeam(db, 'user1', 'team2')
    await addUserToTeam(db, 'user2', 'team2')

    expect(await userIsMemberOfTeam(db, 'user1', 'team1')).toBe(true)
    expect(await userIsMemberOfTeam(db, 'user1', 'team2')).toBe(true)
    expect(await userIsMemberOfTeam(db, 'user1', 'team3')).toBe(false)
    expect(await userIsMemberOfTeam(db, 'user2', 'team1')).toBe(false)
    expect(await userIsMemberOfTeam(db, 'user2', 'team2')).toBe(true)
  })

  test('#grantTeamScopedPermssionToUser should grant a permission to a user scoped to the team', async () => {
    await grantTeamScopedPermissionToUser(db, 'user1', 'team1', 'breakGlass')

    const result = await db
      .collection('relationships')
      .find({ subject: 'user1' })
      .project({ _id: 0 })
      .toArray()
    expect(result).toEqual([
      {
        subject: 'user1',
        subjectType: 'user',
        relation: 'breakGlass',
        resource: 'team1',
        resourceType: 'team'
      }
    ])
  })

  test('#grantTeamScopedPermssionToUser should grant a permission to a user scoped to the team', async () => {
    await grantTeamScopedPermissionToUser(db, 'user1', 'team1', 'breakGlass')
    await revokeTeamScopedPermissionFromUser(db, 'user1', 'team1', 'breakGlass')

    const result = await db
      .collection('relationships')
      .find({ subject: 'user1' })
      .project({ _id: 0 })
      .toArray()
    expect(result).toEqual([])
  })

  test('#findActiveBreakGlassForUser', async () => {
    // Active for user 1
    await grantTeamScopedPermissionToUser(
      db,
      'user1',
      'team1',
      scopeDefinitions.breakGlass.scopeId,
      subHours(new Date(), 1),
      addHours(new Date(), 1)
    )
    // Expired for user 1
    await grantTeamScopedPermissionToUser(
      db,
      'user1',
      'team1',
      scopeDefinitions.breakGlass.scopeId,
      subHours(new Date(), 3),
      subHours(new Date(), 1)
    )
    // Active for user 2
    await grantTeamScopedPermissionToUser(
      db,
      'user2',
      'team1',
      scopeDefinitions.breakGlass.scopeId,
      subHours(new Date(), 1),
      addHours(new Date(), 1)
    )

    const result = await findActiveBreakGlassForUser(db, 'user1')
    expect(result.length).toEqual(1)
  })
})
