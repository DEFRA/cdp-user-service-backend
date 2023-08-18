import Boom from '@hapi/boom'
import { isNull } from 'lodash'
import { getTeam } from '~/src/api/teams/helpers/get-team'
import { getUser } from '~/src/api/users/helpers/get-user'
import { teamHasUser } from '~/src/api/teams/helpers/team-has-user'
import { removeUserFromTeam } from '~/src/api/teams/helpers/remove-user-from-team'
import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'

const removeUserFromTeamController = {
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId

    const dbTeam = await getTeam(request.db, teamId)
    const dbUser = await getUser(request.db, userId)

    if (isNull(dbTeam) || isNull(dbUser) || !teamHasUser(dbTeam, dbUser)) {
      return Boom.notFound('User or Team not found')
    }

    const updateResult = await removeUserFromTeam(
      request.graphClient,
      request.mongoClient,
      request.db,
      userId,
      teamId
    )
    if (updateResult.value) {
      const team = normaliseTeam(updateResult.value, false)
      return h.response({ message: 'success', team }).code(200)
    } else {
      return Boom.notFound()
    }
  }
}

export { removeUserFromTeamController }
