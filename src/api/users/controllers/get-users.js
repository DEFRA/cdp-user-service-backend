import Joi from 'joi'

import { getUsers } from '../helpers/get-users.js'
import { statusCodes } from '@defra/cdp-validation-kit'

/**
 * [
 *   {
 *     "name": string
 *     "email": string,
 *     "github": string,
 *     "createdAt": date,
 *     "updatedAt": date,
 *     "scopes": [{scopeId: string, scopeName: string}],
 *     "relationships": [
 *       {
 *         "_id": "694c000fcd62dd679ba97e73",
 *         "subject": "9732a01a-cf6d-476c-80be-ffedb84cfa9b",
 *         "subjectType": "user",
 *         "relation": "member",
 *         "resource": "ahw-vet-visits",
 *         "resourceType": "team"
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
 *   },...]
 * @type {{options: {validate: {query: *|Joi.ObjectSchema<any>}}, handler: function(*, *): Promise<*>}}
 */
const getUsersController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const query = request.query.query
    const users = await getUsers(request.db, query)
    return h.response(users).code(statusCodes.ok)
  }
}

export { getUsersController }
