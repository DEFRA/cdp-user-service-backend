import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'
import { removeScopeFromTeam } from '~/src/helpers/mongo/transactions/scope/remove-scope-from-team-transaction.js'
import { removeScopeFromUser } from '~/src/helpers/mongo/transactions/scope/remove-scope-from-user-transaction.js'

async function deleteScopeTransaction(request, scopeId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    const scope = await db
      .collection('scopes')
      .findOne({ _id: new ObjectId(scopeId) })

    const teamPromises = scope.teams.map((teamId) =>
      removeScopeFromTeam(db, scopeId, teamId)
    )
    const userPromises = scope.users.map((userId) =>
      removeScopeFromUser(db, scopeId, userId)
    )

    await Promise.all(teamPromises)
    await Promise.all(userPromises)

    return await deleteScope(db, scopeId)
  })
}

function deleteScope(db, scopeId) {
  return db
    .collection('scopes')
    .findOneAndDelete({ _id: new ObjectId(scopeId) })
}

export { deleteScopeTransaction }
