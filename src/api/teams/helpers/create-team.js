import { UTCDate } from '@date-fns/utc'

import { getTeam } from './get-team.js'
import { removeNil } from '../../../helpers/remove-nil.js'

async function createTeam(db, dbTeam) {
  const utcDateNow = new UTCDate()
  const newTeam = {
    ...removeNil(dbTeam),
    _id: normalizeTeamName(dbTeam.name),
    createdAt: utcDateNow,
    updatedAt: utcDateNow
  }
  const insertResult = await db.collection('teams').insertOne(newTeam)
  return await getTeam(db, insertResult.insertedId)
}

function normalizeTeamName(name) {
  return name.toLowerCase().trim()
}

export { createTeam }
