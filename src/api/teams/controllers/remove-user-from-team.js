import { removeUserFromTeam } from '~/src/helpers/mongo/transactions/delete-transactions.js'

const removeUserFromTeamController = {
  options: {
    tags: ['api', 'teams'],
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', '{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId

    const team = await removeUserFromTeam(request, userId, teamId)
    return h.response({ message: 'success', team }).code(200)
  }
}

export { removeUserFromTeamController }
