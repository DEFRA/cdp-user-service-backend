import Joi from 'joi'

import { getTeams } from '../helpers/get-teams.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
    return h.response({ message: 'success', teams }).code(statusCodes.ok)
  }
}

export { getTeamsController }
