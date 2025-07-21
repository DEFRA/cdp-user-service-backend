import { getTeam } from './get-team.js'
import { removeNil } from '../../../helpers/remove-nil.js'
import { randomUUID } from 'node:crypto'

async function createTeam(db, dbTeam) {
  const newTeam = {
    ...removeNil(dbTeam),
    _id: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const insertResult = await db.collection('teams').insertOne(newTeam)
  return await getTeam(db, insertResult.insertedId)
}

export { createTeam }
