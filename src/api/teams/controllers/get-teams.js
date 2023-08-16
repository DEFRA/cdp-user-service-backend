import { getTeams } from '~/src/api/teams/helpers/get-teams'
import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'

const getTeamsController = {
  handler: async (request, h) => {
    const dbTeams = await getTeams(request.db)
    const teams = dbTeams.map(normaliseTeam)
    return h.response({ message: 'success', teams }).code(200)
  }
}

export { getTeamsController }
