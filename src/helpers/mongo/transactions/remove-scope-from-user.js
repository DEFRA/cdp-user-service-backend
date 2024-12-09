import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'
import { removeUserFromScope } from '~/src/helpers/mongo/transactions/remove-user-from-scope.js'

async function removeScopeFromUser(request, userId, scopeId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
    // TODO dry up
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $pull: { scopes: ObjectId.createFromHexString(scopeId) },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await removeUserFromScope(request, userId, scopeId)
  })
}

export { removeScopeFromUser }
