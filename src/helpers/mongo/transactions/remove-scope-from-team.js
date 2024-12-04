import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'
import { removeTeamFromScope } from '~/src/helpers/mongo/transactions/remove-team-from-scope.js'

async function removeScopeFromTeam(request, teamId, scopeId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
    await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        $pull: { scopes: new ObjectId(scopeId) },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await removeTeamFromScope(request, teamId, scopeId)
  })
}

export { removeScopeFromTeam }
