import { relationshipSchema } from './relationship-schema.js'

const collection = 'relationships'

async function createIndexes(db) {
  await db.collection(collection).createIndex({ subject: 1, subjectType: 1 })
  await db.collection(collection).createIndex({ resource: 1, resourceType: 1 })
  await db.collection(collection).createIndex({ relation: 1 })
}

/**
 *
 * @param {{}} db
 * @param {{ subject: string, subjectType: user|team|permission|entity, relation: string, resource: string, resourceType: user|team|permission|entity }} relationship
 * @returns {Promise<void>}
 */
async function addRelationship(db, relationship) {
  const { value, error } = relationshipSchema.validate(relationship)
  if (error) {
    throw error
  }
  await db.collection(collection).insertOne(value)
}

/**
 *
 * @param {{}} db
 * @param {{ subject: string, subjectType: user|team|permission|entity, relation: string, resource: string, resourceType: user|team|permission|entity }} relationship
 * @returns {Promise<void>}
 */
async function removeRelationship(db, relationship) {
  await db.collection(collection).deleteOne(relationship)
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

async function revokePermissionFromUser(db, userId, permission) {
  return removeRelationship(db, {
    subject: userId,
    subjectType: 'user',
    relation: 'granted',
    resource: permission,
    resourceType: 'permission'
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

export {
  addRelationship,
  removeRelationship,
  addUserToTeam,
  removeUserFromTeam,
  grantPermissionToTeam,
  grantPermissionToUser,
  revokePermissionFromTeam,
  revokePermissionFromUser,
  findMembersOfTeam,
  createIndexes
}
