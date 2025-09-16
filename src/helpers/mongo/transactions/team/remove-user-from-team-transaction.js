import { withMongoTransaction } from '../with-mongo-transaction.js'
import {
  removeTeamFromUser,
  removeTeamScopesFromUser,
  removeUserFromTeam
} from '../remove-transaction-helpers.js'

function removeUserFromTeamTransaction({ request, userId, teamId }) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await removeTeamFromUser({ db, session, userId, teamId })
    await removeTeamScopesFromUser({ db, session, userId, teamId })

    return removeUserFromTeam({ db, session, userId, teamId })
  })
}

export { removeUserFromTeamTransaction }
