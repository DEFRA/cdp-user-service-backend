import Joi from 'joi'

import { getTeams } from '~/src/api/teams/helpers/mongo/get-teams.js'

const getTeamsController = {
  options: {
    validate: {
      query: Joi.object({
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
