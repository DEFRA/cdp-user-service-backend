import Boom from '@hapi/boom'
import { createTeam } from '~/src/api/teams/helpers/create-team'
import { createTeamValidationSchema } from '~/src/api/teams/helpers/create-team-validation-schema'
import { getTeam } from '~/src/api/teams/helpers/get-team'
import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'
import { MongoErrors } from '~/src/helpers/mongodb-errors'
import { teamNameExists } from '~/src/api/teams/helpers/team-name-exists'

const createTeamController = {
  options: {
    validate: {
      payload: createTeamValidationSchema
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbTeam = {
      name: payload.name,
      description: payload.description
    }
    try {
      const teamExists = await teamNameExists(request.graphClient, dbTeam.name)
      if (teamExists) {
        return Boom.conflict('Team already exists on AAD')
      }
      const createResult = await createTeam(
        request.graphClient,
        request.db,
        dbTeam
      )
      const teamResult = await getTeam(request.db, createResult.insertedId)
      const team = normaliseTeam(teamResult, false)
      return h.response({ message: 'success', team }).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        return Boom.conflict('Team already exists on DB')
      } else {
        throw error
      }
    }
  }
}

export { createTeamController }
