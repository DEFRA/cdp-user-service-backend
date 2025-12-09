import { createLogger } from '../../../helpers/logging/logger.js'

const logger = createLogger()

/**
 * Updates multiple team documents and deletes any documents that exist
 * in the database but are not present in the input array of team objects.
 *
 * @param {import('mongodb').Db} db The MongoDB database client object.
 * @param {Array<{teamId: string, name: string, description: string|null, github: string|null, serviceCode: string|null}>} teams - The latest teams
 * @returns {Promise<>}
 */
async function syncTeams(db, teams) {
  const collection = db.collection('teams')
  logger.info('Syncing teams' + JSON.stringify(teams))
  const incomingTeamIds = teams.map((team) => team.teamId)

  if (teams.length > 0) {
    const bulkOperations = teams.map((team) => {
      const teamId = team.teamId
      const { teamId: _, ...fieldsToSet } = team

      const updateDoc = {
        $set: fieldsToSet,
        $unset: {
          pending: ''
        }
      }

      return {
        updateOne: {
          filter: { _id: teamId },
          update: updateDoc,
          upsert: true
        }
      }
    })

    try {
      const updateResult = await collection.bulkWrite(bulkOperations, {
        ordered: false
      })
      logger.info(
        `Successfully updated ${updateResult.modifiedCount} documents.`
      )
    } catch (error) {
      logger.error('Error during bulk update operation:', error)
    }
  }

  if (incomingTeamIds.length > 0) {
    // Construct the query: find documents where _id is NOT IN the list of incomingTeamIds
    const filter = {
      _id: { $nin: incomingTeamIds }
    }

    try {
      const deleteResult = await collection.deleteMany(filter)
      logger.info(
        `Successfully deleted ${deleteResult.deletedCount} documents not in the input data.`
      )
    } catch (error) {
      logger.error('Error during delete operation:', error)
      throw error
    }
  } else {
    // Avoid deleting all the teams if the payload is empty.
    logger.warn(
      'No teams in payload. This would delete everything which is probably not what we want.'
    )
  }
}

export { syncTeams }
