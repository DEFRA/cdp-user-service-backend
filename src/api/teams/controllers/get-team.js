import Boom from '@hapi/boom'

import { getTeam } from '../helpers/get-team.js'
import Joi from 'joi'

const getTeamController = {
  options: {
    tags: ['api', 'teams'],
    validate: {
      params: Joi.object({
        teamId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const team = await getTeam(request.db, request.params.teamId)
    if (!team) {
      throw Boom.notFound('Team not found')
    }
    return h.response({ message: 'success', team }).code(200)
  }
}

export { getTeamController }
