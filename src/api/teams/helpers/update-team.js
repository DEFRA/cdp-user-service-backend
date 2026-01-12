import isNull from 'lodash/isNull.js'
import { UTCDate } from '@date-fns/utc'
import { getTeam } from './get-team.js'

async function updateTeam(db, teamId, updateFields) {
  if (!isNull(updateFields)) {
    await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        ...updateFields,
        $set: {
          ...updateFields?.$set,
          updatedAt: new UTCDate()
        }
      }
    )
  }

  return await getTeam(db, teamId)
}

export { updateTeam }
