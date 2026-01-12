import Boom from '@hapi/boom'
import { statusCodes, scopes } from '@defra/cdp-validation-kit'

import { getTeam } from '../helpers/get-team.js'
import { getUser } from '../../users/helpers/get-user.js'
import {
  addUserToTeam,
  userIsMemberOfTeam
} from '../../permissions/helpers/relationships/relationships.js'

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

    if (await userIsMemberOfTeam(request.db, userId, teamId)) {
      return h.response(dbTeam).code(statusCodes.ok)
    }

    await addUserToTeam(request.db, userId, teamId)
    const team = await getTeam(request.db, teamId)

    return h.response(team).code(statusCodes.ok)
  }
}

export { addUserToTeamController }
