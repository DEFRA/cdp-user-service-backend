import { getTeams } from '~/src/api/teams/helpers/get-teams'

const getTeamsController = {
  handler: async (request, h) => {
    const teams = await getTeams(request.db)
    return h.response({ message: 'success', teams }).code(200)
  }
}

export { getTeamsController }
