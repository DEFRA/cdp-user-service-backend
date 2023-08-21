import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'
import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'
import { getTeam } from '~/src/api/teams/helpers/get-team'

async function createTeam(graphClient, db, dbTeam) {
  const groupName = groupNameFromTeamName(dbTeam.name)
  const newGroup = await graphClient.api('/groups').post({
    displayName: groupName,
    description: dbTeam.description,
    mailEnabled: false,
    mailNickname: mailNicknameFromGroupName(groupName),
    securityEnabled: true
  })

  dbTeam._id = newGroup.id
  const insertResult = await db.collection('teams').insertOne(dbTeam)
  return await getTeam(db, insertResult.insertedId)
}

export { createTeam }
