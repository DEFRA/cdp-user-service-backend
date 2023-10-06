import Boom from '@hapi/boom'
import { isNull } from 'lodash'

// import { appConfig } from '~/src/config'
import { getTeam } from '~/src/api/teams/helpers/get-team'
import { getUser } from '~/src/api/users/helpers/get-user'
import { teamHasUser } from '~/src/api/teams/helpers/team-has-user'
import { addUserToTeam } from '~/src/api/teams/helpers/add-user-to-team'

const addUserToTeamController = {
  // options: {
  //   auth: {
  //     strategy: 'azure-oidc',
  //     access: {
  //       scope: [appConfig.get('azureAdminGroupId'), '{params.teamId}']
  //     }
  //   }
  // },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const userId = request.params.userId

    const dbTeam = await getTeam(request.db, teamId)
    const dbUser = await getUser(request.db, userId)

    if (isNull(dbTeam) || isNull(dbUser)) {
      throw Boom.notFound('User or Team not found')
    } else if (teamHasUser(dbTeam, dbUser)) {
      throw Boom.conflict('User already a member of the team')
    }

    const team = await addUserToTeam(
      request.msGraph,
      request.mongoClient,
      request.db,
      userId,
      teamId
    )
    return h.response({ message: 'success', team }).code(200)
  }
}

export { addUserToTeamController }
