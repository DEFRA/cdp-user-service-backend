import Joi from 'joi'

import { getTeams } from '~/src/api/teams/helpers/get-teams'

const getTeamsController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string()
      })
    },
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const teams = await getTeams(request.db, query)
    return h.response({ message: 'success', teams }).code(200)
  }
}

export { getTeamsController }
