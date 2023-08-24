import { omit } from 'lodash'

import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'
import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'
import { getTeam } from '~/src/api/teams/helpers/get-team'

async function updateTeam(msGraph, db, teamId, updateFields) {
  const updateGroupFields = {}
  if (updateFields.name) {
    const groupName = groupNameFromTeamName(updateFields.name)
    updateGroupFields.displayName = groupName
    updateGroupFields.mailNickname = mailNicknameFromGroupName(groupName)
  }

  updateGroupFields.description = updateFields.description ?? null

  await msGraph.api(`/groups/${teamId}`).patch(updateGroupFields)

  const unsetFields = updateFields?.$unset
  const setFields = {
    ...omit(updateFields, ['$unset']),
    updatedAt: new Date()
  }

  await db
    .collection('teams')
    .findOneAndUpdate({ _id: teamId }, { $set: setFields, $unset: unsetFields })

  return await getTeam(db, teamId)
}

export { updateTeam }
