import { mailNicknameFromTeamName } from '~/src/api/teams/helpers/mail-nickname-from-team-name'
import { createLogger } from '~/src/helpers/logger'

const logger = createLogger()

async function createTeam(graphClient, db, dbTeam) {
  const newGroup = await graphClient.api('/groups').post({
    displayName: dbTeam.name,
    description: dbTeam.description,
    mailEnabled: false,
    mailNickname: mailNicknameFromTeamName(dbTeam.name),
    securityEnabled: true
  })
  logger.info(`Created AAD group ${newGroup.id} ${newGroup.displayName}`)

  dbTeam._id = newGroup.id
  const dbResult = await db.collection('teams').insertOne(dbTeam)
  logger.info(`Created team ${dbResult.insertedId} ${dbTeam.name}`)

  return dbResult
}

export { createTeam }
