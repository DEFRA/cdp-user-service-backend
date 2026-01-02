import { strictRelationshipSchema } from './relationship-schema.js'
import isNil from 'lodash/isNil.js'
import { activePermissionFilter } from './active-permission-filter.js'

const collection = 'relationships'

/**
 * @typedef {Object} Relationship
 * @param {string} subject
 * @param {string} subjectType
 * @param {string} relation
 * @param {string} resource
 * @param {string} resourceType
 * @param {Date|null} start
 * @param {Date|null} end
 *
 * @exports Relationship
 */

/**
 * Creates the indexes for the relationship collection.
 * - Two composite indexes for searching by subject or resource.
 * - A unique index to prevent duplicates.
 * - A TLL based on end date to clean up expired relationships.
 *
 * @param {{}} db
 * @returns {Promise<void>}
 */
async function createIndexes(db) {
  await db
    .collection(collection)
    .createIndex({ subject: 1, relation: 1, subjectType: 1 })
  await db
    .collection(collection)
    .createIndex({ resource: 1, relation: 1, resourceType: 1 })

  // Unique constraints
  await db.collection(collection).createIndex(
    {
      subject: 1,
      subjectType: 1,
      relation: 1,
      resource: 1,
      resourceType: 1,
      start: 1,
      end: 1
    },
    { unique: true }
  )

  // Automatically clean up expired relationships.
  await db
    .collection(collection)
    .createIndex({ end: 1 }, { expireAfterSeconds: 0 })
}

/**
 * Helper to first validate and then save a relationship.
 * @param {{}} db
 * @param {{ subject: string, subjectType: user|team|permission|entity, relation: string, resource: string, resourceType: user|team|permission|entity }} relationship
 * @returns {Promise<{}>}
 */
async function addRelationship(db, relationship) {
  const { value, error } = strictRelationshipSchema.validate(relationship)
  if (error) {
    throw error
  }
  try {
    return await db.collection(collection).insertOne(value)
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key, ignore
      return {}
    }
    throw err
  }
}

/**
 * Removes any records that match the given relationship.
 * @param {{}} db
 * @param {{ subject: string, subjectType: user|team|permission|entity, relation: string, resource: string, resourceType: user|team|permission|entity }} relationship
 * @returns {Promise<{}>}
 */
async function removeRelationship(db, relationship) {
  return await db.collection(collection).deleteMany(relationship)
}

/**
 * Makes a user a member of a team.
 * @param {{}} db
 * @param {string} userId
 * @param {string} teamId
 * @returns {Promise<{}>}
 */
async function addUserToTeam(db, userId, teamId) {
  return addRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'member',
    resource: teamId,
    resourceType: 'team'
  })
}

/**
 * Removes a user from a team.
 * @param {{}} db
 * @param {string} userId
 * @param {string} teamId
 * @returns {Promise<{}>}
 */
async function removeUserFromTeam(db, userId, teamId) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
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

/**
 * Creates a short-lived, team-scoped breakGlass, relationship for a given user to a given team.
 * @param {{}} db
 * @param {string} userId
 * @param {string} teamId
 * @param {string} permission
 * @param {Date|null} start
 * @param {Date|null} end
 * @returns {Promise<{}>}
 */
async function grantTeamScopedPermissionToUser(
  db,
  userId,
  teamId,
  permission,
  start,
  end
) {
  return addRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: permission,
    resource: teamId,
    resourceType: 'team',
    ...(start || end ? { start, end } : {})
  })
}

/**
 * Revokes ALL team-scoped relationships of that type for a given user against a given team.
 *
 * @param {{}} db
 * @param {string} userId
 * @param {string} teamId
 * @param {string} permission
 * @returns {Promise<{}>}
 */
async function revokeTeamScopedPermissionFromUser(
  db,
  userId,
  teamId,
  permission
) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: permission,
    resourceType: 'team',
    resource: teamId
  })
}

/**
 * Removes a given permission granted to a user. Does change permissions inherited from their teams.
 * Also does not remove team scoped permissions, for that you'll need to call removeTeamScopedPermissionForUser.
 * @param {{}} db
 * @param {string} userId
 * @param {string} permission
 * @returns {Promise<{}>}
 */
async function revokePermissionFromUser(db, userId, permission) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
  })
}

/**
 * Grants a permission to all members of a team
 * @param {{}} db
 * @param {string} teamId
 * @param {string} permission
 * @returns {Promise<{}>}
 */
async function grantPermissionToTeam(db, teamId, permission) {
  return addRelationship(db, {
    subject: teamId,
    subjectType: 'team',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
  })
}

/**
 * Removes a permission from a team (and any member of that team).
 * @param {{}} db
 * @param {string} teamId
 * @param {string} permission
 * @returns {Promise<{}>}
 */
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
 * Returns a list of userIds that are members of that team.
 * @param {{}} db
 * @param {string} teamId
 * @returns {Promise<string[]>}
 */
async function findMembersOfTeam(db, teamId) {
  const result = await db
    .collection(collection)
    .find(
      {
        resource: teamId,
        resourceType: 'team',
        relation: 'member',
        subjectType: 'user'
      },
      { subject: 1, _id: 0 }
    )
    .toArray()

  return result.map((t) => t.subject)
}

/**
 * Returns a list of teamIds for teams a user is a member of.
 * @param {{}} db
 * @param {string} userId
 * @returns {Promise<string[]>}
 */
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

/**
 * Returns a list of active break-glass relationships for a user.
 * @param {{}} db
 * @param {string} userId
 * @returns {Promise<Relationship[]>}
 */
async function findActiveBreakGlassForUser(db, userId) {
  const activeWindow = activePermissionFilter()
  return await db
    .collection('relationships')
    .find({
      subject: userId,
      subjectType: 'user',
      relation: 'breakGlass',
      ...activeWindow
    })
    .toArray()
}

/**
 * Helper, returns true if user is a member of a given team
 * @param {{}} db
 * @param {string} userId
 * @param {string} teamId
 * @returns {Promise<boolean>}
 */
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

/**
 * Deletes ALL relationships associated to a given team, including permissions & user membership.
 * To be called when deleting a team.
 * @param {{}} db
 * @param {string} teamId
 * @returns {Promise<void>}
 */
async function deleteTeamRelationships(db, teamId) {
  await db
    .collection(collection)
    .deleteMany({ subject: teamId, subjectType: 'team' })
  await db
    .collection(collection)
    .deleteMany({ resource: teamId, resourceType: 'team' })
}

/**
 * Deletes ALL relationships for a user, including permissions, breakglasses & team membership.
 * To be called when deleting a user.
 * @param {{}} db
 * @param {string} userId
 * @returns {Promise<void>}
 */
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
  grantTeamScopedPermissionToUser,
  revokePermissionFromTeam,
  revokePermissionFromUser,
  revokeTeamScopedPermissionFromUser,
  deleteTeamRelationships,
  deleteUserRelationships,
  findActiveBreakGlassForUser,
  findMembersOfTeam,
  findTeamsOfUser,
  userIsMemberOfTeam,
  createIndexes
}
