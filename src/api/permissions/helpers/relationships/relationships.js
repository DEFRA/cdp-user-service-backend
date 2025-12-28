import { relationshipSchema } from './relationship-schema.js'
import isNil from 'lodash/isNil.js'

const collection = 'relationships'

async function createIndexes(db) {
  await db.collection(collection).createIndex({ subject: 1, subjectType: 1 })
  await db.collection(collection).createIndex({ resource: 1, resourceType: 1 })
  await db.collection(collection).createIndex({ relation: 1 })

  // Automatically clean up expired permissions.
  await db
    .collection(collection)
    .createIndex({ end: 1 }, { expireAfterSeconds: 0 })
}

/**
 *
 * @param {{}} db
 * @param {{ subject: string, subjectType: user|team|permission|entity, relation: string, resource: string, resourceType: user|team|permission|entity }} relationship
 * @returns {Promise<{}>}
 */
async function addRelationship(db, relationship) {
  const { value, error } = relationshipSchema.validate(relationship)
  if (error) {
    throw error
  }
  return db.collection(collection).insertOne(value)
}

/**
 * Removes any records that match the given relationship.
 * @param {{}} db
 * @param {{ subject: string, subjectType: user|team|permission|entity, relation: string, resource: string, resourceType: user|team|permission|entity }} relationship
 * @returns {Promise<{}>}
 */
async function removeRelationship(db, relationship) {
  await db.collection(collection).deleteMany(relationship)
}

async function addUserToTeam(db, userId, teamId) {
  return addRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'member',
    resource: teamId,
    resourceType: 'team'
  })
}

async function removeUserFromTeam(db, userId, teamId) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'member',
    resource: teamId,
    resourceType: 'team'
  })
}

async function grantPermissionToUser(db, userId, permission) {
  return addRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
  })
}

async function grantTemporaryPermissionToUser(
  db,
  userId,
  permission,
  start,
  end
) {
  return addRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission',
    start,
    end
  })
}

/**
 * Creates a short-lived, team-scoped breakglass, relationship for a given user to a given team.
 * @param db
 * @param {string} userId
 * @param {string} teamId
 * @param {Date} start
 * @param {Date} end
 * @returns {Promise<{}>}
 */
async function grantBreakGlassToUser(db, userId, teamId, start, end) {
  return addRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'breakGlass',
    resource: teamId,
    resourceType: 'team',
    start,
    end
  })
}

/**
 * Revokes ALL breakGlass relationships for a given user against a given team
 *
 * @param {{}} db
 * @param {string} userId
 * @param {string} teamId
 * @returns {Promise<{}>}
 */
async function revokeBreakGlassForUser(db, userId, teamId) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'breakGlass',
    resourceType: 'team',
    resource: teamId
  })
}

async function revokePermissionFromUser(db, userId, permission) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
  })
}

async function revokeTemporaryPermissionFromUser(
  db,
  userId,
  permission,
  start,
  end
) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission',
    start,
    end
  })
}

async function grantPermissionToTeam(db, teamId, permission) {
  return addRelationship(db, {
    subject: teamId,
    subjectType: 'team',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
  })
}

async function revokePermissionFromTeam(db, teamId, permission) {
  return removeRelationship(db, {
    subject: teamId,
    subjectType: 'team',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
  })
}

/**
 *
 * @param {{}} db
 * @param {string} team
 * @returns {Promise<string[]>}
 */
async function findMembersOfTeam(db, team) {
  const result = await db
    .collection(collection)
    .find(
      {
        resource: team,
        resourceType: 'team',
        relation: 'member',
        subjectType: 'user'
      },
      { subject: 1, _id: 0 }
    )
    .toArray()

  return result.map((t) => t.subject)
}

async function findTeamsOfUser(db, userId) {
  const result = await db
    .collection(collection)
    .find(
      {
        subject: userId,
        resourceType: 'team',
        relation: 'member',
        subjectType: 'user'
      },
      { resource: 1, _id: 0 }
    )
    .toArray()

  return result.map((t) => t.resource)
}

async function userIsMemberOfTeam(db, userId, teamId) {
  const result = await db.collection(collection).findOne({
    subject: userId,
    subjectType: 'user',
    relation: 'member',
    resource: teamId,
    resourceType: 'team'
  })

  return !isNil(result)
}

async function deleteTeamRelationships(db, teamId) {
  await db
    .collection(collection)
    .deleteMany({ subject: teamId, subjectType: 'team' })
  await db
    .collection(collection)
    .deleteMany({ resource: teamId, resourceType: 'team' })
}

async function deleteUserRelationships(db, userId) {
  await db
    .collection(collection)
    .deleteMany({ subject: userId, subjectType: 'user' })
  await db
    .collection(collection)
    .deleteMany({ resource: userId, resourceType: 'user' })
}

export {
  addUserToTeam,
  removeUserFromTeam,
  grantPermissionToTeam,
  grantPermissionToUser,
  grantTemporaryPermissionToUser,
  grantBreakGlassToUser,
  revokePermissionFromTeam,
  revokePermissionFromUser,
  revokeTemporaryPermissionFromUser,
  revokeBreakGlassForUser,
  deleteTeamRelationships,
  deleteUserRelationships,
  findMembersOfTeam,
  findTeamsOfUser,
  userIsMemberOfTeam,
  createIndexes
}
