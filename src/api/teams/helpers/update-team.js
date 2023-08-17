import { mailNicknameFromTeamName } from '~/src/api/teams/helpers/mail-nickname-from-team-name'

async function updateTeam(graphClient, db, teamId, updateFields) {
  const updateGroupFields = {}
  if (updateFields.name) {
    updateGroupFields.displayName = updateFields.name
    updateGroupFields.mailNickname = mailNicknameFromTeamName(updateFields.name)
  }
  if (updateFields.description) {
    updateGroupFields.description = updateFields.description
  }

  await graphClient.api(`/groups/${teamId}`).patch(updateGroupFields)

  return await db
    .collection('teams')
    .findOneAndUpdate(
      { _id: teamId },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
}

export { updateTeam }
