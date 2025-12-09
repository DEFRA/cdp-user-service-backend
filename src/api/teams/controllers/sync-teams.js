import { syncTeamsValidationSchema } from '../helpers/sync-teams-validation-schema.js'
import Boom from '@hapi/boom'
import { syncTeams } from '../helpers/sync-teams.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const syncTeamsController = {
  options: {
    validate: {
      payload: syncTeamsValidationSchema
    }
  },
  handler: async (request, h) => {
    const teams = request.payload?.teams
    if (!teams) throw Boom.badRequest('Missing team data')
    await syncTeams(request.db, teams)
    return h.response().code(statusCodes.ok)
  }
}

export { syncTeamsController }
