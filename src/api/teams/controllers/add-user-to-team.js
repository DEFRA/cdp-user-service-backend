import Boom from '@hapi/boom'

import { getTeam } from '../helpers/get-team.js'
import { getUser } from '../../users/helpers/get-user.js'
import { teamHasUser } from '../helpers/team-has-user.js'
import { addUserToTeam } from '../../../helpers/mongo/transactions/add-user-to-team.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const addUserToTeamController = {
  options: {
    tags: ['api', 'teams'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId

    const dbTeam = await getTeam(request.db, teamId)
    const dbUser = await getUser(request.db, userId)

    if (!dbTeam) {
      throw Boom.notFound('Team not found')
    } else if (!dbUser) {
      throw Boom.notFound('User not found')
    }

    if (teamHasUser(dbTeam, dbUser)) {
      return h.response({ message: 'success', dbTeam }).code(statusCodes.ok)
    }

    const team = await addUserToTeam(request, userId, teamId)

    return h.response({ message: 'success', team }).code(statusCodes.ok)
  }
}

export { addUserToTeamController }
