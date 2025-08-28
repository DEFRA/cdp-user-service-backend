import { getTeam } from './get-team.js'
import { removeNil } from '../../../helpers/remove-nil.js'
import { randomUUID } from 'node:crypto'
import { UTCDate } from '@date-fns/utc'

async function createTeam(db, dbTeam) {
  const utcDateNow = new UTCDate()
  const newTeam = {
    ...removeNil(dbTeam),
    _id: randomUUID(),
    createdAt: utcDateNow,
    updatedAt: utcDateNow
  }
  const insertResult = await db.collection('teams').insertOne(newTeam)
  return await getTeam(db, insertResult.insertedId)
}

export { createTeam }
