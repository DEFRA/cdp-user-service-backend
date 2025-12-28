import { statusCodes, teamIdValidation } from '@defra/cdp-validation-kit'
import Joi from 'joi'
import { getUsersByTeam } from '../helpers/get-users-by-team.js'

/**
 * [
 *   {
 *     "name": string,
 *     "email": string,
 *     "github": string,
 *     "createdAt": date,
 *     "updatedAt": date,
 *     "scopes": [
 *       {
 *         "scopeId": string,
 *         "scopeName": string
 *       }
 *     ],
 *     "teams": [
 *       {
 *         "teamId": string,
 *         "name": string
 *       }
 *     ],
 *     "hasBreakGlass": boolean,
 *     "userId": string
 *   },
 * @type {{options: {validate: {params: *|Joi.ObjectSchema<any>}}, handler: function(*, *): Promise<*>}}
 */
export const getUsersForTeamController = {
  options: {
    validate: {
      params: Joi.object({
        teamId: teamIdValidation
      })
    }
  },
  handler: async (request, h) => {
    const users = await getUsersByTeam(request.db, request.params.teamId)
    return h.response(users).code(statusCodes.ok)
  }
}
