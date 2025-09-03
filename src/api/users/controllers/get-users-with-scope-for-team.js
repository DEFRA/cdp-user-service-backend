import { statusCodes, teamIdValidation } from '@defra/cdp-validation-kit'
import Joi from '../../../helpers/extended-joi.js'
import { getUsersByScopeAndTeam } from '../helpers/get-users-by-scope-and-team.js'

const getUsersWithScopeForTeamController = {
  options: {
    validate: {
      params: Joi.object({
        teamId: teamIdValidation,
        scopeId: Joi.objectId().required()
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
