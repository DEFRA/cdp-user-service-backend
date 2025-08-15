import { teamIdValidation } from '@defra/cdp-validation-kit'
import Joi from '../../../helpers/extended-joi.js'
import { getUsersByTeam } from '../helpers/get-users-by-team.js'

export const getUsersForTeamController = {
  options: {
    tags: ['api', 'users'],
    validate: {
      params: Joi.object({
        teamId: teamIdValidation
      })
    }
  },
  handler: async (request, h) => {
    const users = await getUsersByTeam(request.db, request.params.teamId)
    return h.response({ message: 'success', users }).code(200)
  }
}
