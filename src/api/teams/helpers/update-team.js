import isNull from 'lodash/isNull.js'
import { UTCDate } from '@date-fns/utc'

import { mailNicknameFromGroupName } from './mail-nickname-from-group-name.js'
import { groupNameFromTeamName } from './group-name-from-team-name.js'
import { getTeam } from './get-team.js'

async function updateTeam(db, teamId, updateFields) {
  const updateGroupFields = {}
  if (updateFields?.$set?.name) {
    const groupName = groupNameFromTeamName(updateFields.$set.name)
    updateGroupFields.displayName = groupName
    updateGroupFields.mailNickname = mailNicknameFromGroupName(groupName)
  }
  if (updateFields?.$set?.description) {
    updateGroupFields.description = updateFields.$set.description
  } else if (isNull(updateFields?.$unset?.description)) {
    updateGroupFields.description = null
  }

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
