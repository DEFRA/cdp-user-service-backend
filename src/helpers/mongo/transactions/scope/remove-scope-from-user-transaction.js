import { withMongoTransaction } from '../with-mongo-transaction.js'
import {
  removeScopeFromUser,
  removeUserFromScope
} from '../remove-transaction-helpers.js'

function removeScopeFromUserTransaction({ request, userId, scopeId }) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await removeScopeFromUser({ db, session, scopeId, userId })

    return removeUserFromScope({ db, session, scopeId, userId })
  })
}

export { removeScopeFromUserTransaction }
