import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { getTeam } from '~/src/api/teams/helpers/mongo/get-team'
import { getUser } from '~/src/api/users/helpers/get-user'
import { teamHasUser } from '~/src/api/teams/helpers/team-has-user'
import { addUserToTeam } from '~/src/api/helpers/mongo/transactions/add-user-to-team'

const addUserToTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.oidcAdminGroupId, '{params.teamId}']
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
      return h.response({ message: 'success', dbTeam }).code(200)
    }

    const team = await addUserToTeam(request, userId, teamId)
    await request.msGraph
      .api(`/groups/${teamId}/members/$ref`)
      .post({ '@odata.id': `https://graph.microsoft.com/v1.0/users/${userId}` })

    return h.response({ message: 'success', team }).code(200)
  }
}

export { addUserToTeamController }
