import Joi from 'joi'

import { getTeams } from '../helpers/get-teams.js'

const getTeamsController = {
  options: {
    tags: ['api', 'teams'],
    validate: {
      query: Joi.object({
        query: Joi.string(),
        hasGithub: Joi.boolean(),
        name: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const teams = await getTeams(request.db, request.query)
    return h.response({ message: 'success', teams }).code(200)
  }
}

export { getTeamsController }
