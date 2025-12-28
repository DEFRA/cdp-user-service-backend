async function backfill(db) {
  await db.collection('relationships').drop()
  const users = await db.collection('users').find().toArray()
  const scopes = await db.collection('scopes').find().toArray()

  const bulkInsert = []

  for (const user of users) {
    for (const team of user.teams) {
      bulkInsert.push({
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
      bulkInsert.push({
        subject: user.userId,
        subjectType: 'user',
        relation: 'granted',
        resource: scope.value,
        resourceType: 'permission'
      })
    }

    for (const team of scope.teams) {
      bulkInsert.push({
        subject: team.teamId,
        subjectType: 'team',
        relation: 'granted',
        resource: scope.value,
        resourceType: 'permission'
      })
    }

    for (const member of scope.members) {
      bulkInsert.push({
        subject: member.userId,
        subjectType: 'user',
        relation: scope.value,
        resource: member.teamId,
        resourceType: 'team'
      })
    }
  }

  await db.collection('relationships').insertMany(bulkInsert)
}

export { backfill }
