import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { config } from '~/src/config'
import { getTeam } from '~/src/api/teams/helpers/mongo/get-team'
import { getUser } from '~/src/api/users/helpers/get-user'
import { teamHasUser } from '~/src/api/teams/helpers/team-has-user'
import { removeUserFromTeam } from '~/src/api/teams/helpers/remove-user-from-team'

const removeUserFromTeamController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId

    const dbTeam = await getTeam(request.db, teamId)
    const dbUser = await getUser(request.db, userId)

    if (isNull(dbTeam) || isNull(dbUser) || !teamHasUser(dbTeam, dbUser)) {
      throw Boom.notFound('User or Team not found')
    }

    const team = await removeUserFromTeam(request, userId, teamId)
    return h.response({ message: 'success', team }).code(200)
  }
}

export { removeUserFromTeamController }
