import Boom from '@hapi/boom'

import { getTeam } from '../helpers/get-team.js'

import Joi from 'joi'
import { teamIdValidation, statusCodes } from '@defra/cdp-validation-kit'

const getTeamController = {
  options: {
    validate: {
      params: Joi.object({
        teamId: teamIdValidation
      })
    }
  },
  handler: async (request, h) => {
    const team = await getTeam(request.db, request.params.teamId)
    if (!team) {
      throw Boom.notFound('Team not found')
    }

    return h.response(team).code(statusCodes.ok)
  }
}

export { getTeamController }
