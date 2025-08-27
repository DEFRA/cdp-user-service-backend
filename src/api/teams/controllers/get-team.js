import Boom from '@hapi/boom'

import { getTeam } from '../helpers/get-team.js'

import Joi from 'joi'
import { teamIdValidation } from '@defra/cdp-validation-kit'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const getTeamController = {
  options: {
    tags: ['api', 'teams'],
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
    return h.response({ message: 'success', team }).code(statusCodes.ok)
  }
}

export { getTeamController }
