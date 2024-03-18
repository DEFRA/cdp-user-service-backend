import Joi from 'joi'

import { getTeams } from '~/src/api/teams/helpers/mongo/get-teams'

const getTeamsController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string(),
        hasGithub: Joi.boolean()
      })
    }
  },
  handler: async (request, h) => {
    const teams = await getTeams(request.db, request.query)
    return h.response({ message: 'success', teams }).code(200)
  }
}

export { getTeamsController }
