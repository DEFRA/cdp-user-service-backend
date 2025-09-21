import Boom from '@hapi/boom'

import { getTeam } from '../../../../api/teams/helpers/get-team.js'
import { withMongoTransaction } from '../with-mongo-transaction.js'
import {
  removeTeamFromScopes,
  removeTeamFromUser,
  removeTeamScopesFromUser
} from '../remove-transaction-helpers.js'

async function deleteTeamTransaction({ request, teamId }) {
  const team = await getTeam(request.db, teamId)

  if (!team) {
    throw Boom.notFound('Team not found')
  }

  const mongoTransaction = withMongoTransaction(request)

  await mongoTransaction(async ({ db, session }) => {
    if (team.users?.length) {
      // Remove any team scopes from user.teams
      for (const user of team.users) {
        await removeTeamScopesFromUser({
          db,
          session,
          userId: user.userId,
          teamId
        })
      }

      // Remove the team from user.teams
      for (const user of team.users) {
        await removeTeamFromUser({
          db,
          session,
          userId: user.userId,
          teamId: team.teamId
        })
      }
    }

    // Remove any scopes in scope.teams or scope.members for this team
    await removeTeamFromScopes({
      db,
      session,
      teamId: team.teamId
    })

    const { deletedCount } = await db
      .collection('teams')
      .deleteOne({ _id: teamId }, { session })

    if (deletedCount === 1) {
      request.logger.info(`Team ${team.name} deleted from CDP`)
    }
  })

  return team
}

export { deleteTeamTransaction }
