import Boom from '@hapi/boom'
import { statusCodes, scopes } from '@defra/cdp-validation-kit'

import { getTeam } from '../helpers/get-team.js'
import { getUser } from '../../users/helpers/get-user.js'
import { teamHasUser } from '../helpers/team-has-user.js'
import { addUserToTeamTransaction } from '../../../helpers/mongo/transactions/team/add-user-to-team-transaction.js'

const addUserToTeamController = {
  options: {
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
      return h.response(dbTeam).code(statusCodes.ok)
    }

    const team = await addUserToTeamTransaction(request, userId, teamId)

    return h.response(team).code(statusCodes.ok)
  }
}

export { addUserToTeamController }
