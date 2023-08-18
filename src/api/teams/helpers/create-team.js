import { createLogger } from '~/src/helpers/logger'
import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'
import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'

const logger = createLogger()

async function createTeam(graphClient, db, dbTeam) {
  const groupName = groupNameFromTeamName(dbTeam.name)
  const newGroup = await graphClient.api('/groups').post({
    displayName: groupName,
    description: dbTeam.description,
    mailEnabled: false,
    mailNickname: mailNicknameFromGroupName(groupName),
    securityEnabled: true
  })
  logger.info(`Created AAD group ${newGroup.id} ${newGroup.displayName}`)

  dbTeam._id = newGroup.id
  const dbResult = await db.collection('teams').insertOne(dbTeam)
  logger.info(`Created team ${dbResult.insertedId} ${dbTeam.name}`)

  return dbResult
}

export { createTeam }
