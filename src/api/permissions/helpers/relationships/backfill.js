import { addRelationship } from './relationships.js'

async function backfill(db) {
  await db.collection('relationships').drop()
  const users = await db.collection('users').find().toArray()
  const scopes = await db.collection('scopes').find().toArray()

  for (const user of users) {
    for (const team of user.teams) {
      await addRelationship(db, {
        subject: user._id,
        subjectType: 'user',
        relation: 'member',
        resource: team,
        resourceType: 'team'
      })
    }
  }

  for (const scope of scopes) {
    for (const user of scope.users) {
      await addRelationship(db, {
        subject: user.userId,
        subjectType: 'user',
        relation: 'granted',
        resource: scope.value,
        resourceType: 'permission'
      })
    }

    for (const team of scope.teams) {
      await addRelationship(db, {
        subject: team.teamId,
        subjectType: 'team',
        relation: 'granted',
        resource: scope.value,
        resourceType: 'permission'
      })
    }

    for (const member of scope.members) {
      await addRelationship(db, {
        subject: member.userId,
        subjectType: 'user',
        relation: scope.value,
        resource: member.teamId,
        resourceType: 'team'
      })
    }
  }
}

export { backfill }
