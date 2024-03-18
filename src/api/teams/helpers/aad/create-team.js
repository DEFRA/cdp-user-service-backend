import { config } from '~/src/config'
import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'
import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'
import { getTeam } from '~/src/api/teams/helpers/mongo/get-team'
import { removeNil } from '~/src/helpers/remove-nil'

async function createTeam(msGraph, db, dbTeam) {
  const groupName = groupNameFromTeamName(dbTeam.name)
  const newGroup = await msGraph.api('/groups').post({
    displayName: groupName,
    description: dbTeam.description,
    mailEnabled: false,
    mailNickname: mailNicknameFromGroupName(groupName),
    securityEnabled: true,
    'owners@odata.bind': [
      `https://graph.microsoft.com/v1.0/servicePrincipals/${config.get(
        'azureServicePrincipalId'
      )}`
    ]
  })
  const newTeam = {
    ...removeNil(dbTeam),
    _id: newGroup.id,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const insertResult = await db.collection('teams').insertOne(newTeam)
  return await getTeam(db, insertResult.insertedId)
}

export { createTeam }
