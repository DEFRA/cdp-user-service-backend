import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { getTeamByGithub } from '~/src/api/teams/helpers/get-team-by-github'

const getTeamByGithubController = {
  handler: async (request, h) => {
    const team = await getTeamByGithub(request.db, request.params.githubId)
    if (isNull(team)) {
      throw Boom.notFound('Team not found')
    }
    return h.response({ message: 'success', team }).code(200)
  }
}

export { getTeamByGithubController }
