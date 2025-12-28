import Joi from 'joi'

import { getTeams } from '../helpers/get-teams.js'
import { statusCodes } from '@defra/cdp-validation-kit'

/**
 * [
 *   {
 *     "name": string,
 *     "description": string,
 *     "github": string,
 *     "serviceCodes": [string],
 *     "createdAt": date,
 *     "updatedAt": date,
 *     "scopes": [
 *       {
 *         "scopeId": "67d298c20bac2c4a0dc553ac",
 *         "scopeName": "restrictedTechPython"
 *       }
 *     ],
 *     "teamId": string,
 *     "users": [
 *       {
 *         "userId": string,
 *         "name": string,
 *         "hasBreakGlass": boolean
 *       }
 *     ]
 *   },...]
 * @type {{options: {validate: {query: *|Joi.ObjectSchema<any>}}, handler: function(*, *): Promise<*>}}
 */
const getTeamsController = {
  options: {
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
    return h.response(teams).code(statusCodes.ok)
  }
}

export { getTeamsController }
