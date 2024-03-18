import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { getTeam } from '~/src/api/teams/helpers/mongo/get-team'

const getTeamController = {
  handler: async (request, h) => {
    const team = await getTeam(request.db, request.params.teamId)
    if (isNull(team)) {
      throw Boom.notFound('Team not found')
    }
    return h.response({ message: 'success', team }).code(200)
  }
}

export { getTeamController }
