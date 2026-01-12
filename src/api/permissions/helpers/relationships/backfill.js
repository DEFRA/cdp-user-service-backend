import Joi from 'joi'
import { strictRelationshipSchema } from './relationship-schema.js'
import { createLogger } from '../../../../helpers/logging/logger.js'

const logger = createLogger()

async function backfill(db) {
  await db.collection('relationships').drop()
  const users = await db.collection('users').find().toArray()
  const scopes = await db.collection('scopes').find().toArray()

  const teamIds = new Set(
    (await db.collection('teams').find().project({ _id: 1 }).toArray()).map(
      (t) => t._id
    )
  )

  const bulkInsert = []

  for (const user of users) {
    for (const team of user.teams) {
      if (!teamIds.has(team)) {
        logger.warn(`${user._id} belongs to ${team} which does not exist`)
        continue
      }

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
      if (!teamIds.has(team.teamId)) {
        logger.warn(`${team.teamId} does not exist`)
        continue
      }

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
        resourceType: 'team',
        start: member.startDate,
        end: member.endDate
      })
    }
  }
  Joi.assert(bulkInsert, Joi.array().items(strictRelationshipSchema))

  await db.collection('relationships').insertMany(bulkInsert)
}

export { backfill }
