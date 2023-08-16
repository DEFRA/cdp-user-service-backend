import Boom from '@hapi/boom'
import { createTeam } from '~/src/api/teams/helpers/create-team'
import { createTeamValidationSchema } from '~/src/api/teams/helpers/create-team-validation-schema'
import { getTeam } from '~/src/api/teams/helpers/get-team'
import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'
import { MongoErrors } from '~/src/helpers/mongodb-errors'

const createTeamController = {
  options: {
    validate: {
      payload: createTeamValidationSchema
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbTeam = {
      _id: payload.teamId,
      name: payload.name,
      description: payload.description
    }
    try {
      const createResult = await createTeam(request.db, dbTeam)
      const teamResult = await getTeam(request.db, createResult.insertedId)
      const team = normaliseTeam(teamResult, false)
      return h.response({ message: 'success', team }).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        return Boom.conflict('Team already exists')
      } else {
        throw error
      }
    }
  }
}

export { createTeamController }
