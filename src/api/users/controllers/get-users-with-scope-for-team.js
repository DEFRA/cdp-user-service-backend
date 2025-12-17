import { statusCodes, teamIdValidation } from '@defra/cdp-validation-kit'
import Joi from 'joi'
import { getUsersByScopeAndTeam } from '../helpers/get-users-by-scope-and-team.js'

const getUsersWithScopeForTeamController = {
  options: {
    validate: {
      params: Joi.object({
        teamId: teamIdValidation,
        scopeId: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const users = await getUsersByScopeAndTeam(
      request.db,
      request.params.scopeId,
      request.params.teamId
    )
    return h.response(users).code(statusCodes.ok)
  }
}

export { getUsersWithScopeForTeamController }
