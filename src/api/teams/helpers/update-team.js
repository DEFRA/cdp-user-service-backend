import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'
import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'
import { getTeam } from '~/src/api/teams/helpers/get-team'

async function updateTeam(graphClient, db, teamId, updateFields) {
  const updateGroupFields = {}
  if (updateFields.name) {
    const groupName = groupNameFromTeamName(updateFields.name)
    updateGroupFields.displayName = groupName
    updateGroupFields.mailNickname = mailNicknameFromGroupName(groupName)
  }
  if (updateFields.description) {
    updateGroupFields.description = updateFields.description
  }

  await graphClient.api(`/groups/${teamId}`).patch(updateGroupFields)

  const updatedFields = {
    ...updateFields,
    updatedAt: new Date()
  }
  await db
    .collection('teams')
    .findOneAndUpdate({ _id: teamId }, { $set: updatedFields })

  return await getTeam(db, teamId)
}

export { updateTeam }
