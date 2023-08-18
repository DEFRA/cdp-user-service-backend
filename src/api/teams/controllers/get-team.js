import Boom from '@hapi/boom'
import { isNull } from 'lodash'
import { getTeam } from '~/src/api/teams/helpers/get-team'
import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'

const getTeamController = {
  handler: async (request, h) => {
    const dbTeam = await getTeam(request.db, request.params.teamId)
    if (isNull(dbTeam)) {
      return Boom.notFound('Team not found')
    }
    const team = normaliseTeam(dbTeam)
    return h.response({ message: 'success', team }).code(200)
  }
}

export { getTeamController }
